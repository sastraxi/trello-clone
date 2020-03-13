import 'dotenv/config';

import SecretStore from './util/secret-store';
import MongoClient from './util/mongo-client';

import setupAuth from './setup/auth';
import setupExpress from './setup/express';
import setupTrello from './setup/trello';

import SyncModel from './db/sync';
import CloneBoard from './task/clone-board';

const tokenStore = SecretStore('tokens');

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
setupAuth(app, tokenStore);
setupTrello(app);

app.get('/', async (req, res) => {
  const client = await MongoClient();
  {
    const Sync = SyncModel(client.db());
    res.render('index', {
      title: 'Trello Sync / Clone',
      user: req.user,
      syncs: await Sync.all(),
    });
  }
  client.close();
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
    source: sourceId,
    target: targetId,
    label,
  } = req.body;
  
  if (sourceId === targetId) {
    return res.status(400).send('Source and target must be distinct!');
  }

  // FIXME: shouldn't have to keep re-fetching
  const boards = await req.trello.boards();
  const source = boards.find((board: any) => board.id === sourceId);
  const target = boards.find((board: any) => board.id === targetId);

  const client = await MongoClient();
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

  const client = await MongoClient();
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

  const client = await MongoClient();
  {
    const Sync = SyncModel(client.db());
    await Sync.delete(id);
  }
  client.close();

  return res.redirect('/');
});

app.get('/me', async (req, res) => {
  return res.status(200).json(await req.trello.me());
});

app.get('/boards', async (req, res) => {
  return res.status(200).json(await req.trello.boards());
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`visit http://localhost:${port} to get started`));
