import { get } from '../throttled-request';
import { CardFacet } from '../definitions';

export default (token: string) =>
  (cardId: string, targetListId: string, cardFacets: CardFacet[]) =>
    get('https://api.trello.com/1/cards', {
      key: process.env.TRELLO_KEY,
      token,
      keepFromSource: cardFacets.join(','),
      idList: targetListId,
      idCardSource: cardId,
    }).then(res => res.body);
