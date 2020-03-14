import { Application } from 'express';
import passport from 'passport';
import { Strategy as TrelloStrategy } from 'passport-trello';
import pick from 'lodash.pick';

import TrelloApi from '../trello';
import deployedUrl from '../util/url';
import getMongoClient from '../util/mongo-client';

import UserModel, { User } from '../db/user';

const PROFILE_FIELDS = [
  'id',
  'email',
  'fullName',
  'username',
  'avatarUrl',
];

export default (app: Application): void => {
  // set up our integration with Trello, and define what happens when Trello redirects back to us
  passport.use(new TrelloStrategy({
      consumerKey: process.env.TRELLO_KEY,
      consumerSecret: process.env.TRELLO_SECRET,
      callbackURL: `${deployedUrl}/auth/callback`,
      trelloParams: {
        scope: 'read,write',
        name: 'trello-clone',
        expiration: 'never',
      }
    },
    async (token: string, tokenSecret: string, _profile: any, cb: Function) => {
      try {
        // FIXME: _profile has me() in it so we don't need to call the API ourselves
        const trello = TrelloApi(token);
        const profile = await trello.me();
        cb(null, {
          ...pick(profile, PROFILE_FIELDS),
          token,
          tokenSecret,
        });
      } catch (err) {
        console.error('error in strategy', err);
      }
    },
  ));

  // allow users to be stored in / retrieved from the session
  passport.serializeUser((user: User, cb) => cb(null, user.id));
  passport.deserializeUser(async (userId: string, cb) => {
    const client = await getMongoClient();
    try {
      const db = client.db();
      const User = UserModel(db);
      cb(null, User.find(userId));
    } catch (err) {
      console.error('could not deserialize user', err);
      cb(err);
    } finally {
      client.close();
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // auth routes
  app.get('/auth/login', passport.authenticate('trello'));
  app.get('/auth/callback', 
    passport.authenticate('trello', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });
};
