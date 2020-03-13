import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import mustacheExpress from 'mustache-express';
import ConnectMongodbSession from 'connect-mongodb-session';

import { databaseUrl, connectionOptions } from '../util/mongo-client';

const MongoStore = ConnectMongodbSession(session);
const MONGO_SESSION_COLLECTION = "sessions";

export default () => {
  const app = express();

  app.use(session({
    name: 'trello-clone.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 120,
    },
    rolling: true,
    store: new MongoStore({
      uri: databaseUrl,
      connectionOptions,
      collection: MONGO_SESSION_COLLECTION,
    }),
  }));

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );

  app.use(bodyParser.urlencoded({ extended: true }));
  
  app.engine('mustache', mustacheExpress());
  app.set('view engine', 'mustache');
  app.use(express.static('public'));
    
  return app;
};
