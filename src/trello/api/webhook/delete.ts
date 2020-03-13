import { del } from '../../throttled-request';

/**
 * Destroy a webhook
 */
export default (token: string) => (webhookId: string): Promise<any> =>
  del(`/1/webhooks/${webhookId}`, {
    key: process.env.TRELLO_KEY,
    token,
  });
