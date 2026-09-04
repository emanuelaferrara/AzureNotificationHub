import type {
  NotificationSubscription,
  NotificationSubscriptionCreateParameters,
  NotificationSubscriptionTemplate,
  NotificationSubscriptionUpdateParameters,
} from 'azure-devops-node-api/interfaces/NotificationInterfaces';

export type AzureDevOpsClientOptions = {
  /** Organization URL, e.g. 'https://dev.azure.com/MyOrg/' (trailing slash optional). */
  orgUrl: string;
  /** Azure DevOps Personal Access Token. */
  token: string;
};

/** Azure DevOps list responses are shaped `{ count, value: T[] }`. */
type AzureList<T> = { count: number; value: T[] };

/**
 * Minimal Azure DevOps REST client built on React Native's fetch.
 *
 * We deliberately do NOT use azure-devops-node-api at runtime: it's a Node
 * server SDK whose HTTP layer (typed-rest-client -> browserified stream-http)
 * hangs on Hermes' XHR. We keep the package only for its `.d.ts` types and issue
 * requests with fetch, which RN supports natively.
 */
export class AzureDevOpsClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;

  constructor({ orgUrl, token }: AzureDevOpsClientOptions) {
    this.baseUrl = orgUrl.endsWith('/') ? orgUrl : `${orgUrl}/`;
    // Azure DevOps PAT auth is HTTP Basic with an empty-ish username: base64("PAT:<token>").
    this.authHeader = `Basic ${encodeBase64(`PAT:${token}`)}`;
  }

  /** GET an Azure DevOps REST resource and parse the JSON body. */
  private async getJson<T>(path: string, apiVersion: string): Promise<T> {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}${path}${sep}api-version=${apiVersion}`;
    const res = await fetch(url, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(
        `Azure DevOps ${res.status} ${res.statusText} for ${path}: ${body.slice(0, 200)}`,
      );
    }
    return (await res.json()) as T;
  }

  /** POST a JSON body to an Azure DevOps REST resource and parse the JSON response. */
  private async postJson<TResponse>(
    path: string,
    apiVersion: string,
    body: unknown,
  ): Promise<TResponse> {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}${path}${sep}api-version=${apiVersion}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(
        `Azure DevOps ${res.status} ${res.statusText} for ${path}: ${errBody.slice(0, 200)}`,
      );
    }
    return (await res.json()) as TResponse;
  }

  /** PATCH a JSON body to an Azure DevOps REST resource. */
  private async patchJson<TResponse>(
    path: string,
    apiVersion: string,
    body: unknown,
  ): Promise<TResponse> {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}${path}${sep}api-version=${apiVersion}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(
        `Azure DevOps ${res.status} ${res.statusText} for ${path}: ${errBody.slice(0, 200)}`,
      );
    }
    return (await res.json()) as TResponse;
  }

  /** List the notification subscriptions visible to the token's user. */
  async listSubscriptions(): Promise<NotificationSubscription[]> {
    const { value } = await this.getJson<AzureList<NotificationSubscription>>(
      '_apis/notification/subscriptions',
      '7.1-preview.1',
    );
    return value;
  }

  /** List the subscription templates (the catalogue of subscribable event types). */
  async getSubscriptionTemplates(): Promise<NotificationSubscriptionTemplate[]> {
    const { value } = await this.getJson<
      AzureList<NotificationSubscriptionTemplate>
    >('_apis/notification/subscriptiontemplates', '7.1-preview.1');
    return value;
  }

  /** Create a new notification subscription and return the created resource. */
  async createSubscription(
    params: NotificationSubscriptionCreateParameters,
  ): Promise<NotificationSubscription> {
    return this.postJson<NotificationSubscription>(
      '_apis/notification/subscriptions',
      '7.1-preview.1',
      params,
    );
  }

  /** Update fields on an existing notification subscription. */
  async updateSubscription(
    subscriptionId: string,
    params: NotificationSubscriptionUpdateParameters,
  ): Promise<NotificationSubscription> {
    return this.patchJson<NotificationSubscription>(
      `_apis/notification/subscriptions/${encodeURIComponent(subscriptionId)}`,
      '7.1-preview.1',
      params,
    );
  }
}

/**
 * Base64-encode an ASCII/Latin-1 string. RN/Hermes doesn't reliably expose
 * `btoa`, and there's no Node `Buffer`, so we fall back to a small encoder.
 * The only input here is the ASCII "PAT:<token>" credential.
 */
function encodeBase64(input: string): string {
  const maybeBtoa = (globalThis as any).btoa;
  if (typeof maybeBtoa === 'function') {
    return maybeBtoa(input);
  }
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let i = 0; i < input.length; i += 3) {
    const b1 = input.charCodeAt(i);
    const b2 = i + 1 < input.length ? input.charCodeAt(i + 1) : NaN;
    const b3 = i + 2 < input.length ? input.charCodeAt(i + 2) : NaN;
    const e1 = b1 >> 2;
    const e2 = ((b1 & 3) << 4) | (Number.isNaN(b2) ? 0 : b2 >> 4);
    const e3 = Number.isNaN(b2) ? 64 : ((b2 & 15) << 2) | (Number.isNaN(b3) ? 0 : b3 >> 6);
    const e4 = Number.isNaN(b3) ? 64 : b3 & 63;
    output +=
      chars[e1] + chars[e2] + (e3 === 64 ? '=' : chars[e3]) + (e4 === 64 ? '=' : chars[e4]);
  }
  return output;
}
