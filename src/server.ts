import 'dotenv/config';

import createDebugger from 'debug';
import express from 'express';
import session from 'express-session';
import Bottleneck from 'bottleneck';
import bodyParser from 'body-parser';
import cors from 'cors';

import passport from 'passport';
import OAuth1Strategy from 'passport-oauth1';

import mongoClient from './mongo-client';
import { MongoClient } from 'mongodb';

import request from 'superagent';

const debug = createDebugger('trello-clone');
const TOKEN_COLLECTION = 'tokens';

['SESSION_SECRET', 'TRELLO_KEY', 'TRELLO_SECRET', 'LIMIT_MAX_CONCURRENT', 'LIMIT_MIN_TIME_MS']
  .forEach((v) => {
    if (!(v in process.env)) {
      console.error(`Please provide a ${v} in your .env file.`);
      process.exit(1);
    }
  });

const app = express();

passport.use(new OAuth1Strategy({
    requestTokenURL: 'https://trello.com/1/OAuthGetRequestToken',
    accessTokenURL: 'https://trello.com/1/OAuthGetAccessToken',
    userAuthorizationURL: 'https://trello.com/1/OAuthAuthorizeToken',
    consumerKey: process.env.TRELLO_KEY,
    consumerSecret: process.env.TRELLO_SECRET,
    callbackURL: `http://localhost:${process.env.PORT}/auth/callback`,
    signatureMethod: 'HMAC-SHA1',
  },
  async (token: String, tokenSecret: String, _profile: any, cb: Function) => {
    const response = await request.get('https://api.trello.com/1/members/me')
      .query({
        key: process.env.TRELLO_KEY,
        token,
      });

    // TODO: save token + secret to mongo

    cb(null, {
      id: response.body.id,
      token,
    });
  },
));

passport.serializeUser(({ id }, cb) =>
  cb(null, id));

passport.deserializeUser((id, cb) =>
  cb(null, { id }));

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

app.use(passport.initialize());
app.use(passport.session());

const limiter = new Bottleneck({
  maxConcurrent: +process.env.LIMIT_MAX_CONCURRENT,
  minTime: +process.env.LIMIT_MIN_TIME_MS,
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Ready to build something awesome?',
  });
});

app.get('/auth/login', passport.authenticate('oauth'));
app.get('/auth/callback', 
  passport.authenticate('oauth', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });


app.post('/abcdef', (req, res) => {
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
