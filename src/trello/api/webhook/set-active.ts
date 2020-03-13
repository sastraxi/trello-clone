import { put } from '../../throttled-request';

/**
 * Watch a board by setting up an incoming webhook.
 * @returns the ID of the new webhook
 */
export default (token: string) => (webhookId: string, active: boolean): Promise<any> =>
  put(`/1/webhooks/${webhookId}`, {
    key: process.env.TRELLO_KEY,
    token,
    active,
  });
