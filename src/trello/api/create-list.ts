import { post } from '../throttled-request';

/**
 * Returns the new list's ID.
 */
export default (token: string) => (boardId: string, name: string, pos?: any): Promise<string> =>
  post(`/1/lists`, {
    key: process.env.TRELLO_KEY,
    token,
    idBoard: boardId,
    name,
    pos,
  }).then(r => r.body.id);
