import type {
  EmailHtmlSubscriptionChannel,
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
const KEPT_TEAM_TEMPLATE_ID = 'ms.vss-work.workitem-changed-subscription-template';

/**
 * Mention has no subscription template but the backend parses it, so we add it
 * by hand with a minimal event-type-only filter.
 */
const MENTION_TARGET: RelayTarget = {
  label: 'A mention of you',
  filter: { type: 'Expression', eventType: 'ms.vss-mentions.identity-mention-event' },
};

const client = new AzureDevOpsClient({ orgUrl, token: getToken() });

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
function buildTargets(templates: NotificationSubscriptionTemplate[]): RelayTarget[] {
  const fromTemplates = templates
    .filter(isTargetTemplate)
    .filter((t): t is NotificationSubscriptionTemplate & { filter: ISubscriptionFilter } =>
      Boolean(t.filter && t.description),
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
    console.error('[azure] setSubscriptions: could not read state, skipping:', error?.message);
    return;
  }

  const done = new Set(
    existing.map(relayLabelOf).filter((label): label is string => label !== undefined),
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
      `${targets.length - missing.length} already present, ${failures.length} failed`,
  );
  if (failures.length > 0) {
    console.error('[azure] relay subscription failures:\n  ' + failures.join('\n  '));
  }
}
