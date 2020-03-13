import { TrelloApi } from './definitions';

import me from './api/me';
import boards from './api/boards';
import lists from './api/lists';
import archiveList from './api/archive-list';
import deleteAllCards from './api/delete-all-cards';
import cloneCard from './api/clone-card';
import createList from './api/create-list';

import createWebhook from './api/webhook/create';
import deleteWebhook from './api/webhook/delete';
import setWebhookActive from './api/webhook/set-active';

export default (token: string): TrelloApi => ({
  me: me(token),

  boards: boards(token),

  deleteAllCards: deleteAllCards(token),
  cloneCard: cloneCard(token),

  lists: lists(token),
  archiveList: archiveList(token),
  createList: createList(token),

  createWebhook: createWebhook(token),
  deleteWebhook: deleteWebhook(token),
  setWebhookActive: setWebhookActive(token),
});
