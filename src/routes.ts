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

export default (app: Application): void => {
  app.get('/', loggedIn, getRoot);

  app.post('/webhook/:boardId', postIncomingWebhook);
  app.head('/webhook/:boardId', (req, res) => {
    console.log('all good');
    return res.status(200).send('ok');
  })

  app.get('/monitor/new', loggedIn, getMonitorCreate);  
  app.post('/monitor/new', loggedIn, postMonitorCreate);
  app.post('/monitor/delete/:id', loggedIn, postMonitorDelete);

  app.get('/sync/new', loggedIn, getSyncCreate);
  app.post('/sync/new', loggedIn, postSyncCreate);
  app.post('/sync/delete/:id', loggedIn, postSyncDelete);
  app.post('/sync/:id', loggedIn, postSync);
};
