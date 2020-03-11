import { TrelloApi } from './definitions';

import me from './api/me';
import boards from './api/boards';
import lists from './api/lists';
import archiveList from './api/archive-list';
import deleteAllCards from './api/delete-all-cards';
import cloneCard from './api/clone-card';
import createList from './api/create-list';

export default (token: string): TrelloApi => ({
  me: me(token),
  boards: boards(token),
  lists: lists(token),
  archiveList: archiveList(token),
  deleteAllCards: deleteAllCards(token),
  cloneCard: cloneCard(token),
  createList: createList(token),
});
