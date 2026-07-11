import type { NotificationSubscription } from 'azure-devops-node-api/interfaces/NotificationInterfaces';
import { AzureDevOpsClient } from './AzureDevOpsClient';

const orgUrl = 'https://dev.azure.com/EconomiaRGS1Collection/';

// TODO: token is managed by you — load it from secure config, not source.
const token = '';

const client = new AzureDevOpsClient({ orgUrl, token });

export async function getNotifications(): Promise<NotificationSubscription[]> {
  try {
    const subscriptions = await client.listSubscriptions();
    console.log('[azure] subscriptions:', subscriptions.length);
    console.log({ subscriptions });
    return subscriptions;
  } catch (error: any) {
    console.error('[azure] getNotifications failed:', error?.message);
    return [];
  }
}
