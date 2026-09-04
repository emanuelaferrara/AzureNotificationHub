import type {
  EmailHtmlSubscriptionChannel,
  ExpressionFilter,
  ExpressionFilterClause,
  ISubscriptionFilter,
  NotificationSubscription,
  NotificationSubscriptionTemplate,
} from 'azure-devops-node-api/interfaces/NotificationInterfaces';
import { AzureDevOpsClient } from './AzureDevOpsClient';

const orgUrl = 'https://dev.azure.com/EconomiaRGS1Collection/';

// TODO: token is managed by you — load it from secure config, not source.
const token = '';

function getToken(): string {
  return token;
}

/** Gmail inbox the backend watches; every relay subscription delivers here. */
const RELAY_ADDRESS = 'marcodanielenotificationrelay@gmail.com';

/** Description prefix identifying app-managed relay subscriptions. */
const MARKER = '[ANH] ';

/**
 * The one `team` template we keep (see CONTEXT.md): "A work item is changed".
 * The other two team templates carry placeholder filters and are skipped.
 */
const KEPT_TEAM_TEMPLATE_ID =
  'ms.vss-work.workitem-changed-subscription-template';

/**
 * Mention has no subscription template but the backend parses it, so we add it
 * by hand with a minimal event-type-only filter.
 */
const MENTION_TARGET: RelayTarget = {
  label: 'A mention of you',
  filter: {
    type: 'Expression',
    eventType: 'ms.vss-mentions.identity-mention-event',
  },
};

const client = new AzureDevOpsClient({ orgUrl, token: getToken() });

export type RelaySubscription = {
  id: string;
  label: string;
  category: string;
  enabled: boolean;
  statusMessage?: string;
};

export type RepositoryPreference = {
  id: string;
  name: string;
  project: string;
};

export type RepositoryPreferences = {
  repositories: RepositoryPreference[];
  /** null means no repository constraint (all repositories). */
  selectedNames: string[] | null;
};

const REPOSITORY_FIELD_BY_EVENT_TYPE: Record<string, string> = {
  'ms.vss-code.git-push-event': 'ms.vss-code.repository-name-event-field',
  'ms.vss-code.git-pullrequest-event':
    'ms.vss-code.git-pullrequest-repository-name-event-field',
};

/** Used to express “no repositories” with a valid, non-matching filter value. */
const NO_REPOSITORY_VALUE = '__ANH_NO_REPOSITORY__';

type RelayTarget = {
  /** Human label shown after the [ANH] marker; also the idempotency key. */
  label: string;
  filter: ISubscriptionFilter;
};

export async function getSubscriptions(): Promise<NotificationSubscription[]> {
  try {
    const subscriptions = await client.listSubscriptions();
    console.log('[azure] subscriptions:', subscriptions.length);
    console.log({ subscriptions });
    return subscriptions;
  } catch (error: any) {
    console.error('[azure] getSubscriptions failed:', error?.message);
    return [];
  }
}

/** Should this template be part of the relay set? All `both`/`user` + the one kept `team`. */
function isTargetTemplate(t: NotificationSubscriptionTemplate): boolean {
  // The SDK types `type` as a numeric enum, but the raw REST API (which we hit
  // via fetch) returns the string form: "both" | "user" | "team".
  const type = t.type as unknown as string;
  return type === 'both' || type === 'user' || t.id === KEPT_TEAM_TEMPLATE_ID;
}

/** The full set of relay targets: chosen templates + the hand-added mention. */
function buildTargets(
  templates: NotificationSubscriptionTemplate[],
): RelayTarget[] {
  const fromTemplates = templates
    .filter(isTargetTemplate)
    .filter(
      (
        t,
      ): t is NotificationSubscriptionTemplate & {
        filter: ISubscriptionFilter;
      } => Boolean(t.filter && t.description),
    )
    .map<RelayTarget>(t => ({ label: t.description!, filter: t.filter }));

  return [...fromTemplates, MENTION_TARGET];
}

/** True if the subscription is one of our relay subscriptions; returns its label if so. */
function relayLabelOf(sub: NotificationSubscription): string | undefined {
  const channel = sub.channel as EmailHtmlSubscriptionChannel | undefined;
  const targetsRelay =
    channel?.useCustomAddress === true &&
    channel.address?.toLowerCase() === RELAY_ADDRESS.toLowerCase();
  const description = sub.description ?? '';
  if (targetsRelay && description.startsWith(MARKER)) {
    return description.slice(MARKER.length).trim();
  }
  return undefined;
}

/** Azure returns enum values as either numbers or their string names. */
function isSubscriptionEnabled(
  status: NotificationSubscription['status'],
): boolean {
  if (typeof status === 'number') {
    return status >= 0;
  }

  return (
    status === undefined || String(status).toLowerCase().startsWith('enabled')
  );
}

/** Map Azure DevOps event namespaces to the product areas users recognise. */
function categoryForEventType(eventType?: string): string {
  const normalized = eventType?.toLowerCase() ?? '';

  if (normalized.includes('mentions')) return 'Mentions';
  if (normalized.includes('vss-work.')) return 'Boards';
  if (normalized.includes('vss-code.')) return 'Repos';
  if (
    normalized.includes('vss-build.') ||
    normalized.includes('pipeline') ||
    normalized.includes('release')
  ) {
    return 'Pipelines';
  }
  if (
    normalized.includes('testmanagement') ||
    normalized.includes('vss-test.')
  ) {
    return 'Test Plans';
  }
  if (normalized.includes('wiki')) return 'Wiki';

  return 'Other';
}

/** List only subscriptions owned by this app, suitable for display in Settings. */
export async function getRelaySubscriptions(): Promise<RelaySubscription[]> {
  const subscriptions = await client.listSubscriptions();

  return subscriptions
    .map<RelaySubscription | undefined>(subscription => {
      const label = relayLabelOf(subscription);
      if (!label || !subscription.id) return undefined;

      return {
        id: subscription.id,
        label,
        category: categoryForEventType(subscription.filter.eventType),
        enabled: isSubscriptionEnabled(subscription.status),
        statusMessage: subscription.statusMessage,
      };
    })
    .filter((subscription): subscription is RelaySubscription =>
      Boolean(subscription),
    )
    .sort((a, b) => a.label.localeCompare(b.label));
}

function repositoryClausesOf(
  subscription: NotificationSubscription,
): ExpressionFilterClause[] {
  const fieldName =
    REPOSITORY_FIELD_BY_EVENT_TYPE[subscription.filter.eventType ?? ''];
  if (!fieldName) return [];
  const filter = subscription.filter as ExpressionFilter;
  return (
    filter.criteria?.clauses?.filter(
      clause => clause.fieldName === fieldName,
    ) ?? []
  );
}

/** Load repositories and the selection currently enforced by the relay subscriptions. */
export async function getRepositoryPreferences(): Promise<RepositoryPreferences> {
  const [repositories, subscriptions] = await Promise.all([
    client.listRepositories(),
    client.listSubscriptions(),
  ]);

  const relaySubscriptions = subscriptions.filter(subscription =>
    relayLabelOf(subscription),
  );
  const repositoryClauses = relaySubscriptions.flatMap(repositoryClausesOf);
  const selectedNames =
    repositoryClauses.length === 0
      ? null
      : ([
          ...new Set(
            repositoryClauses.map(clause => clause.value).filter(Boolean),
          ),
        ].filter(name => name !== NO_REPOSITORY_VALUE) as string[]);

  return {
    repositories: repositories
      .filter(
        repository =>
          !repository.isDisabled && repository.id && repository.name,
      )
      .map(repository => ({
        id: repository.id!,
        name: repository.name!,
        project: repository.project?.name ?? 'Other',
      }))
      .sort(
        (a, b) =>
          a.project.localeCompare(b.project) || a.name.localeCompare(b.name),
      ),
    selectedNames,
  };
}

function withRepositoryFilter(
  baseFilter: ISubscriptionFilter,
  fieldName: string,
  selectedNames: string[] | null,
): ISubscriptionFilter {
  if (selectedNames === null) return baseFilter;

  const expressionFilter = baseFilter as ExpressionFilter;
  const baseCriteria = expressionFilter.criteria;
  const baseClauses = baseCriteria?.clauses ?? [];
  const values =
    selectedNames.length > 0 ? selectedNames : [NO_REPOSITORY_VALUE];
  const start =
    Math.max(0, ...baseClauses.map(clause => clause.index ?? 0)) + 1;
  const repositoryClauses: ExpressionFilterClause[] = values.map(
    (value, offset) => ({
      fieldName,
      operator: 'equalTo',
      value,
      index: start + offset,
      logicalOperator:
        baseClauses.length === 0 && offset === 0
          ? ''
          : offset === 0
          ? 'AND'
          : 'OR',
    }),
  );

  const filtered: ExpressionFilter = {
    ...expressionFilter,
    type: 'Expression',
    criteria: {
      ...baseCriteria,
      clauses: [...baseClauses, ...repositoryClauses],
      groups:
        repositoryClauses.length > 1
          ? [
              ...(baseCriteria?.groups ?? []),
              { start, end: start + repositoryClauses.length - 1, level: 1 },
            ]
          : baseCriteria?.groups ?? [],
      maxGroupLevel: Math.max(
        baseCriteria?.maxGroupLevel ?? 0,
        repositoryClauses.length > 1 ? 1 : 0,
      ),
    },
  };
  return filtered;
}

/** Persist the repository selection in every relay subscription that Azure can filter by repo. */
export async function setRepositoryPreferences(
  selectedNames: string[] | null,
): Promise<void> {
  const [subscriptions, templates] = await Promise.all([
    client.listSubscriptions(),
    client.getSubscriptionTemplates(),
  ]);
  const targetsByLabel = new Map(
    buildTargets(templates).map(target => [target.label, target]),
  );

  const updates = subscriptions.flatMap(subscription => {
    const label = relayLabelOf(subscription);
    const eventType = subscription.filter.eventType ?? '';
    const fieldName = REPOSITORY_FIELD_BY_EVENT_TYPE[eventType];
    const target = label ? targetsByLabel.get(label) : undefined;
    if (!subscription.id || !fieldName || !target) return [];

    return [
      client.updateSubscription(subscription.id, {
        filter: withRepositoryFilter(target.filter, fieldName, selectedNames),
      }),
    ];
  });

  await Promise.all(updates);
}

/** Enable or disable an app-managed relay subscription. */
export async function setRelaySubscriptionEnabled(
  subscriptionId: string,
  enabled: boolean,
): Promise<void> {
  // SubscriptionStatus.Enabled = 0; SubscriptionStatus.Disabled = -1.
  await client.updateSubscription(subscriptionId, { status: enabled ? 0 : -1 });
}

function relayChannel(): EmailHtmlSubscriptionChannel {
  return { type: 'EmailHtml', address: RELAY_ADDRESS, useCustomAddress: true };
}

/**
 * Ensure a relay subscription exists for every target, creating only the missing
 * ones. Idempotent: safe to run on every app startup. Never touches subscriptions
 * that aren't [ANH]-marked relay subscriptions.
 */
export async function setSubscriptions(): Promise<void> {
  let existing: NotificationSubscription[];
  let templates: NotificationSubscriptionTemplate[];
  try {
    [existing, templates] = await Promise.all([
      client.listSubscriptions(),
      client.getSubscriptionTemplates(),
    ]);
  } catch (error: any) {
    console.error(
      '[azure] setSubscriptions: could not read state, skipping:',
      error?.message,
    );
    return;
  }

  const done = new Set(
    existing
      .map(relayLabelOf)
      .filter((label): label is string => label !== undefined),
  );

  const targets = buildTargets(templates);
  const missing = targets.filter(t => !done.has(t.label));

  let created = 0;
  const failures: string[] = [];
  for (const target of missing) {
    try {
      await client.createSubscription({
        description: `${MARKER}${target.label}`,
        filter: target.filter,
        channel: relayChannel(),
      });
      created += 1;
    } catch (error: any) {
      failures.push(`${target.label}: ${error?.message ?? 'unknown error'}`);
    }
  }

  console.log(
    `[azure] relay subscriptions: provisioned ${created} new, ` +
      `${targets.length - missing.length} already present, ${
        failures.length
      } failed`,
  );
  if (failures.length > 0) {
    console.error(
      '[azure] relay subscription failures:\n  ' + failures.join('\n  '),
    );
  }
}
