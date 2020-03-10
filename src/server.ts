import 'dotenv/config';

import createDebugger from 'debug';

import SecretStore from './util/secret-store';
import MongoClient from './util/mongo-client';

import setupAuth from './setup/auth';
import setupExpress from './setup/express';
import setupTrello from './setup/trello';

import SyncModel from './db/sync';

const tokenStore = SecretStore('tokens');
const debug = createDebugger('trello-clone');

['SESSION_SECRET', 'TRELLO_KEY', 'TRELLO_SECRET', 'LIMIT_MAX_CONCURRENT', 'LIMIT_MIN_TIME_MS']
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

  // FIXME: shouldn't have to keep re-fetching
  const boards = await req.trello.boards();
  console.log(req.body);
  const source = boards.find(board => board.id === sourceId);
  const target = boards.find(board => board.id === targetId);

  const client = await MongoClient();
  {
    const Sync = SyncModel(client.db());
    const sync = await Sync.create(source, target, [label]);
    console.log('created sync');
    console.log(JSON.stringify(sync, null, 2));
  }
  client.close();

  // back home to see the new list of syncs
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
  console.log(`visit http://localhost:${port}/auth/login to get started`));
