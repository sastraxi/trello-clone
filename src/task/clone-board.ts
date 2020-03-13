import flatMap from 'lodash.flatmap';
import some from 'lodash.some';

import {
  TrelloApi,
  StringMap,
  Card,
  CardFacet,
} from '../trello/definitions';

export default (trello: TrelloApi) => async (sourceId: string, targetId: string, labelColours: string[]) => {
  if (sourceId === targetId) {
    throw new Error(`Source and target boards must be distinct!`);
  }

  // FIXME: just get what we need
  const boards = await trello.boards();
  const sourceBoard = boards.find(board => board.id === sourceId);
  const targetBoard = boards.find(board => board.id === targetId);
  if (!sourceBoard) throw new Error(`Could not find board ${sourceId}`);
  if (!targetBoard) throw new Error(`Could not find board ${targetId}`);

  const sourceLists = await trello.lists(sourceBoard.id);
  const sourceListNames = sourceLists.map(l => l.name);

  await trello.deleteAllCards(targetBoard.id);
  
  const targetLists = await trello.lists(targetBoard.id);
  const targetListNames = targetLists.map(l => l.name);

  // trello doesn't allow deleting lists, so instead we'll archive the ones
  // that don't match before creating new ones to match the source board
  await Promise.all(
    targetLists
      .filter(list => sourceListNames.indexOf(list.name) === -1)
      .map(list => trello.archiveList(list.id))
  );
  
  await Promise.all(
    sourceLists
      .filter(list => targetListNames.indexOf(list.name) === -1)
      .map(list => trello.createList(targetBoard.id, list.name, list.pos))
  );

  // console.log(JSON.stringify(targetLists, null, 2));

  // FIXME: for now, just re-fetch the lists so we have an up-to-date name-to-id mapping
  const finalLists = await trello.lists(targetBoard.id);
  const targetListIdFromName: StringMap = {};
  finalLists.forEach(list => targetListIdFromName[list.name] = list.id);

  await Promise.all(
    flatMap(
      sourceLists,
      list => list.cards.map((card: Card) => ({
        ...card,
        listId: targetListIdFromName[list.name]
      }))
    )
      .filter(card => some(card.labels, (label: any) => labelColours.indexOf(label.color) !== -1))
      .map(card => trello.cloneCard(card.id, card.listId, [
        CardFacet.attachments,
        CardFacet.comments,
        CardFacet.members,
        CardFacet.checklists,
        CardFacet.due,
        CardFacet.stickers,
      ]))
  );

  return true;
};
