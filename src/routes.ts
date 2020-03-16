import { Application } from "express";

import loggedIn from './auth/logged-in';

import getRoot from './controller/root';
import postIncomingWebhook from './controller/incoming-webhook';
import getMonitorCreate from './controller/monitor/create-get';
import postMonitorCreate from './controller/monitor/create-post';
import postMonitorDelete from './controller/monitor/delete';
import getSyncCreate from './controller/sync/create-get';
import postSyncCreate from './controller/sync/create-post';
import postSyncDelete from './controller/sync/delete';
import postSync from './controller/sync/post';
import getWebhooks from './controller/webhooks/get';
import postWebhookDelete from './controller/webhooks/delete';

export default (app: Application): void => {
  app.get('/', loggedIn, getRoot);

  app.post('/webhook/:boardId', postIncomingWebhook);
  app.head('/webhook/:boardId', (req, res) => res.status(200).send('ok'));
  // ^ FIXME: responds to HEAD with 404 without this...

  app.get('/monitor/new', loggedIn, getMonitorCreate);  
  app.post('/monitor/new', loggedIn, postMonitorCreate);
  app.post('/monitor/delete/:id', loggedIn, postMonitorDelete);

  app.get('/sync/new', loggedIn, getSyncCreate);
  app.post('/sync/new', loggedIn, postSyncCreate);
  app.post('/sync/delete/:id', loggedIn, postSyncDelete);
  app.post('/sync/:id', loggedIn, postSync);

  app.get('/webhooks', loggedIn, getWebhooks);
  app.post('/webhooks/delete/:id', loggedIn, postWebhookDelete);
};
