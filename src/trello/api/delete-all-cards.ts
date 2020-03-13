import { Card } from '../definitions';
import { get, del } from '../throttled-request';

export default (token: string) =>
  async (boardId: string): Promise<number> => {

    const cards = await get(`/1/boards/${boardId}/cards`, {
      key: process.env.TRELLO_KEY,
      token,
      fields: 'id',
      filter: 'all',
    }).then(res => res.body);

    await Promise.all(
      cards.map((card: Card) => 
        del(`/1/cards/${card.id}`, {
          key: process.env.TRELLO_KEY,
          token,
        })
      )
    );

    return 0;
  };
