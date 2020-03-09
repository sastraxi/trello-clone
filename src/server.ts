import 'dotenv/config';

import createDebugger from 'debug';

import SecretStore from './util/secret-store';
import TrelloApi from './util/trello-api';

import setupAuth from './setup/auth';
import setupExpress from './setup/express';

const tokenStore = SecretStore('tokens');
const debug = createDebugger('trello-clone');

['SESSION_SECRET', 'TRELLO_KEY', 'TRELLO_SECRET', 'LIMIT_MAX_CONCURRENT', 'LIMIT_MIN_TIME_MS']
  .forEach((v) => {
    if (!(v in process.env)) {
      console.error(`Please provide a ${v} in your .env file.`);
      process.exit(1);
    }
  });

const app = setupExpress();
setupAuth(app, tokenStore);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Ready to build something awesome?',
  });
});

app.get('/boards', async (req, res) => {
  const trello = TrelloApi(req.user.token);
  return res.status(200).json(await trello.boards());
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`visit http://localhost:${port}/auth/login to get started`));
