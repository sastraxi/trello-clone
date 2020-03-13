import some from 'lodash.some';
import flatMap from 'lodash.flatmap';
import createDebugger from 'debug';

import { put, post, get } from '../throttled-request';
import { CardFacet } from '../definitions';

const debug = createDebugger('trello-clone:clone-card');

enum CompletionStatus {
  complete = "complete",
  incomplete = "incomplete",
}

const hasAny = (list: any[], sought: any[]) =>
  some(list, x => sought.indexOf(x) !== -1);

const fetchCard = (token: string, cardId: string) =>
  get(`/1/cards/${cardId}`, {
    key: process.env.TRELLO_KEY,
    token,
    fields: 'due,dueComplete',
    checklists: 'all',
  }).then(res => res.body);

interface ChecklistItem {
  id: string;
  name: string;
  idChecklist: string;
  state: CompletionStatus;
  pos: number;
  due?: any;
  nameData?: any;
  idMember?: string;
}

const checklistItemMatchPredicate =
  (toMatch: ChecklistItem) =>
    (candidate: ChecklistItem) =>
      toMatch.pos === candidate.pos &&
      toMatch.name === candidate.name;

const extractChecklistItemsFromCard = (card: any): ChecklistItem[] =>
  flatMap(card.checklists, (c: any) => c.checkItems);

export default (token: string) =>
  async (sourceCardId: string, targetListId: string, cardFacets: CardFacet[]) => {
    const newCardId = await post('/1/cards', {
      key: process.env.TRELLO_KEY,
      token,
      keepFromSource: cardFacets.join(','),
      idList: targetListId,
      idCardSource: sourceCardId,
    }).then(res => res.body.id);
    
    const newCard = await fetchCard(token, newCardId);

    debug('NEW CARD DETAILS....................');
    debug(JSON.stringify(newCard, null, 2));

    if (newCard.checklists.length === 0 && newCard.due === null) return;
    if (!hasAny(cardFacets, [CardFacet.all, CardFacet.checklists, CardFacet.due])) return;

    const sourceCard = await fetchCard(token, sourceCardId);

    debug('SOURCE CARD DETAILS....................');
    debug(JSON.stringify(sourceCard, null, 2));

    // as per https://developers.trello.com/reference/#cards-2
    // checklist items are copied but not marked as completed, so do it manually
    // TODO: can we instead just copy the checklist as a separate action and get the statuses?
    if (newCard.checklists.length > 0 && hasAny(cardFacets, [CardFacet.all, CardFacet.checklists])) {

      // match up checklist items by name + pos
      const sourceItems = extractChecklistItemsFromCard(sourceCard);
      const newItems = extractChecklistItemsFromCard(newCard);

      await Promise.all(
        sourceItems
          .filter(item => item.state === CompletionStatus.complete)
          .map((sourceItem) => {
            const newItem = newItems.find(checklistItemMatchPredicate(sourceItem));
            if (!newItem) {
              console.error(`Could not find a matching source card for checklist item ${sourceItem.id}!`);
              return undefined;
            }
            return put(`/1/cards/${newCard.id}/checkItem/${newItem.id}`, {
              key: process.env.TRELLO_KEY,
              token,
              state: CompletionStatus.complete,
            });
          })
          .filter(x => x !== undefined)
      );
    }

    // similar to the above, due dates are not marked as "complete" either
    if (newCard.due && hasAny(cardFacets, [CardFacet.all, CardFacet.due])) {
      await put(`/1/cards/${newCard.id}`, {
        key: process.env.TRELLO_KEY,
        token,
        dueComplete: sourceCard.dueComplete,
      });
    }
  };
