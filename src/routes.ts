import { Application } from "express";

import loggedIn from './auth/logged-in';

import getRoot from './handler/root';
import postIncomingWebhook from './handler/root';
import getMonitorCreate from './handler/monitor/create-get';
import postMonitorCreate from './handler/monitor/create-post';
import postMonitorDelete from './handler/monitor/delete';
import getSyncCreate from './handler/sync/create-get';
import postSyncCreate from './handler/sync/create-post';
import postSyncDelete from './handler/sync/delete';
import postSync from './handler/sync/post';

export default (app: Application): void => {
  app.get('/', loggedIn, getRoot);

  app.post('/webhook/:boardId', postIncomingWebhook);

  app.get('/monitor/new', loggedIn, getMonitorCreate);  
  app.post('/monitor/new', loggedIn, postMonitorCreate);
  app.post('/monitor/delete/:id', loggedIn, postMonitorDelete);

  app.get('/sync/new', loggedIn, getSyncCreate);
  app.post('/sync/new', loggedIn, postSyncCreate);
  app.post('/sync/delete/:id', loggedIn, postSyncDelete);
  app.post('/sync/:id', loggedIn, postSync);
};
