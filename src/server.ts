import 'dotenv/config';

import setupAuth from './auth/setup';
import setupExpress from './setup/express';
import setupTrello from './setup/trello';
import setupDb from './setup/db';
import connectRoutes from './routes';

import deployedUrl from './util/url';

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
connectRoutes(app);
setupDb().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log(`visit ${deployedUrl} to get started`));
});
