import 'dotenv/config';

import createDebugger from 'debug';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import OAuth1Strategy from 'passport-oauth1';

import pick from 'lodash.pick';

import SecretStore from './secret-store';
import TrelloApi from './trello-api';

const tokens = SecretStore('tokens');
const debug = createDebugger('trello-clone');

const PROFILE_FIELDS = [
  'id',
  'username',
  'avatarUrl',
  'fullName',
];

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
  async (token: string, tokenSecret: string, _profile: any, cb: Function) => {
    try {
      await tokens.set(token, tokenSecret);
      const trello = TrelloApi(token);
      const profile = await trello.me();
      cb(null, {
        ...pick(profile, PROFILE_FIELDS),
        token,
      });
    } catch (err) {
      console.error('error in strategy', err);
    }
  },
));

passport.serializeUser((profile: object, cb) => cb(null, JSON.stringify(profile)));
passport.deserializeUser((json: string, cb) => cb(null, JSON.parse(json)));

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

app.get('/boards', async (req, res) => {
  const trello = TrelloApi(req.user.token);
  return res.status(200).json(await trello.boards());
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`visit http://localhost:${port}/auth/login to get started`));
