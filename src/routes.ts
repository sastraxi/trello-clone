import { Application } from "express";

import getMongoClient from './util/mongo-client';

import loggedIn from './auth/logged-in';

import SyncModel from './db/sync';
import CloneBoard from './task/clone-board';
import { Board } from './trello/definitions';

import handler from './handler';

export default (app: Application): void => {

  app.get('/', loggedIn, handler.root);

  app.post('/webhook/:boardId', handler.incomingWebhook);

  app.get('/monitor/new', loggedIn, handler.monitor.createForm);  
  app.post('/monitor/new', loggedIn, handler.monitor.create);
  app.post('/monitor/delete/:id', loggedIn, handler.monitor.delete);

  app.get('/sync/new', loggedIn, async (req, res) => {
    return res.render('new-sync', {
      title: 'New Trello Sync',
      user: req.user,
      boards: await req.trello.boards(),
    });
  });
  
  app.post('/sync/new', loggedIn, async (req, res) => {
    const {
      sourceId,
      targetId,
      label,
    } = req.body;
    
    if (sourceId === targetId) {
      return res.status(400).send('Source and target must be distinct!');
    }
  
    // FIXME: shouldn't have to keep re-fetching
    const boards = await req.trello.boards();
    const source = boards.find((board: Board) => board.id === sourceId);
    const target = boards.find((board: Board) => board.id === targetId);
  
    const client = await getMongoClient();
    try {
      const Sync = SyncModel(client.db());
      await Sync.create(source, target, [label]);
    } finally {
      client.close();
    }
  
    return res.redirect('/');
  });
  
  app.post('/sync/:id', loggedIn, async (req, res) => {
    const { id } = req.params;
    const cloneBoard = CloneBoard(req.trello);
  
    const client = await getMongoClient();
    try {
      const Sync = SyncModel(client.db());
      const sync = await Sync.get(id);
      console.log(`Syncing ${sync.source.name} to ${sync.target.name}...`);
      try {
        await cloneBoard(sync.source.id, sync.target.id, sync.labels);
        await Sync.touch(id);
        console.log('Done!');
      } catch (err) {
        console.error(err);
        console.log("error; see above");
      }
    } finally {
      client.close();
    }
  
    return res.redirect('/');
  });
  
  app.post('/sync/delete/:id', loggedIn, async (req, res) => {
    const { id } = req.params;
  
    const client = await getMongoClient();
    try {
      const Sync = SyncModel(client.db());
      await Sync.delete(id);
    } finally {
      client.close();
    }
  
    return res.redirect('/');
  });  

};
