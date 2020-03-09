import 'dotenv/config';

import createDebugger from 'debug';
import express from 'express';
import session from 'express-session';
import Bottleneck from 'bottleneck';
import bodyParser from 'body-parser';
import cors from 'cors';

const debug = createDebugger('trello-clone');

import mongoClient from './mongo-client';
import { MongoClient } from 'mongodb';

const TOKEN_COLLECTION = 'tokens';

['SESSION_SECRET', 'LIMIT_MAX_CONCURRENT', 'LIMIT_MIN_TIME_MS'].forEach((v) => {
  if (!(v in process.env)) {
    console.error(`Please provide a ${v} in your .env file.`);
    process.exit(1);
  }
});

const app = express();

app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 120,
  },
  rolling: true,
}));

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(bodyParser.text({ type: "*/*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const limiter = new Bottleneck({
  maxConcurrent: +process.env.LIMIT_MAX_CONCURRENT,
  minTime: +process.env.LIMIT_MIN_TIME_MS,
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Ready to build something awesome?',
  });
});

app.post('/authorize', (req, res) => {
  try {
    mongoClient((err: any, mongo: MongoClient) => {
      if (err) {
        console.error(err);
      }
    });
  } catch (err) {
    // TODO: debug(...)
    console.error('Received error at top-level!', err);
  }
});

const port = process.env.PORT || 3000;
app.listen(port , () =>
  console.log('trello-clone server running at http://localhost:' + port));

/*
try {
  

    app.post('/', async (req, res) => {
      const body: string = Array.isArray(req.body) ? req.body.join('\n') : req.body;

      const metrics = body.split('\n')
        .filter(x => x.trim() !== '')
        .map(x => JSON.parse(x));

      if (await limiter.currentReservoir() < metrics.length) {
        return res
          .status(429)
          .header('X-Rate-Limit-Remaining', `${await limiter.currentReservoir()}`)
          .json({
            status: 'Over rate limit!',
          });
      }

      return limiter.schedule({ weight: metrics.length }, async () => {
        try {
          const db = mongo.db();
          const collection = db.collection(TOKEN_COLLECTION);
          const result = await collection.insertMany(metrics);
          // TODO: debug(...)
          console.log(`Inserted ${metrics.length} records!`);
          return res
            .status(200)
            .header('X-Rate-Limit-Remaining', `${await limiter.currentReservoir()}`)
            .json({
              status: 'OK',
              insert: metrics.length,
            });
        } catch (err) {
          console.error('mongo', err);
          return res.status(500).json({ status: 'Mongo errored out!' });
        }
      }).catch(console.error);
    });

  });
} catch (err) {
}
*/
