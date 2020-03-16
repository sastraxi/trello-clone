import { post } from '../../throttled-request';

import deployedUrl from '../../../util/url';

/**
 * Watch a board by setting up an incoming webhook.
 * @returns the ID of the new webhook
 */
export default (token: string) => (boardId: string, description?: string): Promise<string> => {
  const query = {
    key: process.env.TRELLO_KEY,
    token,
    description,
    idModel: boardId,
    callbackURL: `${deployedUrl}/webhook/${boardId}`,
    active: true,
  };
  return post(`/1/webhooks`, query).then(r => r.body.id);
};
