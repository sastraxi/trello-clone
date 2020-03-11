import { Card } from '../definitions';
import { get, del } from '../throttled-request';

export default (token: string) =>
  async (boardId: string): Promise<number> => {
    const cards = await get(`https://api.trello.com/1/boards/${boardId}/cards`, {
      key: process.env.TRELLO_KEY,
      token,
      fields: 'id',
      filter: 'all',
    }).then(res => res.body);

    console.log(cards);

    const responses = await Promise.all(cards.map((card: Card) =>
      del(`https://api.trello.com/1/cards/${card.id}`, {
        key: process.env.TRELLO_KEY,
        token,
      })
    ));

    console.log(JSON.stringify(responses, null, 2))
    return 0;
  };
