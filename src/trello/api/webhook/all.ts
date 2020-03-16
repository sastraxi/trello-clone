import { get } from '../../throttled-request';
import { Webhook } from '../../definitions';

/**
 * Watch a board by setting up an incoming webhook.
 * @returns the ID of the new webhook
 */
export default (token: string) => (): Promise<Webhook[]> => {
  const query = {
    key: process.env.TRELLO_KEY,
    token,
  };
  return get(`/1/tokens/${token}/webhooks`, query)
    .then(r => r.body)
    .catch((err) => {
      console.log('error in webhook/all', JSON.stringify(query, null, 2));
      console.error(err, JSON.stringify(err, null, 2));
    });
};
