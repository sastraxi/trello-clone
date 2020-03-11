import { TrelloApi } from '../trello/definitions';

export default (trello: TrelloApi) => async (sourceId: string, targetId: string) => {
  if (sourceId === targetId) {
    throw new Error(`Source and target boards must be distinct!`);
  }

  // FIXME: just get what we need
  const boards = await trello.boards();
  const source = boards.find(board => board.id === sourceId);
  const target = boards.find(board => board.id === targetId);
  if (!source) throw new Error(`Could not find board ${sourceId}`);
  if (!target) throw new Error(`Could not find board ${targetId}`);

  // get all the lists and cards on the source board
  // get all the lists and cards on the target board
  // delete all cards and lists on the target board
  // create lists on the target board (batch)
  // create each card. idCardSource: ___, keepFromSource: all, idList: ____ (batch)
};
