import { put } from '../throttled-request';

export default (token: string) => (listId: string): Promise<void> =>
  put(`http://api.trello.com/1/lists/${listId}`, {
    key: process.env.TRELLO_KEY,
    token,
    closed: true,
  }).then(r => r.body);
