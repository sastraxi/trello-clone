import { get } from '../throttled-request';

export default (token: string) => (boardId: string): Promise<any[]> =>
  get(`https://api.trello.com/1/boards/${boardId}/lists`, {
    key: process.env.TRELLO_KEY,
    token,
    cards: 'open',
    card_fields: 'id,labels',
    filter: 'open',
    fields: 'name',
  }).then(r => r.body);
