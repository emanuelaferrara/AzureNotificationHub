import * as azdev from './azure';

const orgUrl = 'https://dev.azure.com/EconomiaRGS1Collection/';

const token = '';

const authHandler = azdev.getPersonalAccessTokenHandler(token);

const connection = new azdev.WebApi(orgUrl, authHandler);

const organization = 'EconomiaRGS1Collection';
const service = '';

export async function getNotifications() {
  const result = await connection.connect();
  if (result.authenticatedUser) {
    console.log({ 'result.authenticatedUser': result.authenticatedUser });
  }

  console.log(result);

  const endpoint = `https://${service}dev.azure.com/${organization}/_apis/notification/subscriptions?api-version=7.2-preview.1`;

  const response = await fetch(endpoint);
  if (response.ok) {
    console.log(response.json());
    return;
  }

  console.log(response);

  //   try {
  //     const notificationApi = await connection.getNotificationApi();

  //     const subscriptions = await notificationApi.listSubscriptions();

  //     console.log({ subscriptions });
  //   } catch (error) {
  //     console.error('Error fetching notifications:', error);
  //   }
}
