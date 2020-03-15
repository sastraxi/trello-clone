import 'dotenv/config';

import getMongoClient from './util/mongo-client';

import setupAuth from './setup/auth';
import setupExpress from './setup/express';
import setupTrello from './setup/trello';

import SyncModel from './db/sync';
import MonitorModel from './db/monitor';
import CloneBoard from './task/clone-board';
import { Board } from './trello/definitions';

[
  'SESSION_SECRET',
  'TRELLO_KEY',
  'TRELLO_SECRET',
  'LIMIT_MAX_CONCURRENT',
  'LIMIT_MIN_TIME_MS',
]
  .forEach((key) => {
    if (!(key in process.env)) {
      console.error(`Please provide a ${key} in your .env file.`);
      process.exit(1);
    }
  });

const app = setupExpress();
setupAuth(app);
setupTrello(app);

app.get('/', async (req, res) => {
  const client = await getMongoClient();
  {
    const db = client.db();
    const Sync = SyncModel(db);
    const Monitor = MonitorModel(db);
    res.render('index', {
      title: 'Trello Sync / Clone',
      user: req.user,
      syncs: await Sync.all(),
      monitors: await Monitor.all(),
    });
  }
  client.close();
}); 

app.get('/monitor/new', async (req, res) => {
  return res.render('new-monitor', {
    title: 'New Monitored Board',
    user: req.user,
    boards: await req.trello.boards(),
  });
});

app.post('/monitor/new', async (req, res) => {
  const { boardId, delaySeconds } = req.body;
  
  // FIXME: shouldn't have to keep re-fetching; at least just get the one
  const boards = await req.trello.boards();
  const board = boards.find((board: Board) => board.id === boardId);

  const webhookId = await req.trello.createWebhook(board.id,
    `trello-sync monitor webhook for ${board.name} created by ${req.user.username}`);

  const client = await getMongoClient();
  {
    const Monitor = MonitorModel(client.db());
    await Monitor.create(req.user.id, webhookId, board, +delaySeconds);
  }
  client.close();

  return res.redirect('/');
});

app.get('/sync/new', async (req, res) => {
  return res.render('new-sync', {
    title: 'New Trello Sync',
    user: req.user,
    boards: await req.trello.boards(),
  });
});

app.post('/sync/new', async (req, res) => {
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
  {
    const Sync = SyncModel(client.db());
    await Sync.create(source, target, [label]);
  }
  client.close();

  return res.redirect('/');
});

app.post('/sync/:id', async (req, res) => {
  const { id } = req.params;
  const cloneBoard = CloneBoard(req.trello);

  const client = await getMongoClient();
  {
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
  }
  client.close();

  return res.redirect('/');
});

app.post('/sync/delete/:id', async (req, res) => {
  const { id } = req.params;

  const client = await getMongoClient();
  {
    const Sync = SyncModel(client.db());
    await Sync.delete(id);
  }
  client.close();

  return res.redirect('/');
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`visit http://localhost:${port} to get started`));
