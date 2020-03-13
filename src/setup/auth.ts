import passport from 'passport';
import { Strategy as TrelloStrategy } from 'passport-trello';
import pick from 'lodash.pick';

import TrelloApi from '../trello';
import { Store } from '../util/secret-store';
import { Application } from 'express';

const PROFILE_FIELDS = [
  'id',
  'username',
  'avatarUrl',
  'fullName',
];

export default (app: Application, tokenStore: Store) => {
  // set up our integration with Trello, and define what happens when Trello redirects back to us
  passport.use(new TrelloStrategy({
      consumerKey: process.env.TRELLO_KEY,
      consumerSecret: process.env.TRELLO_SECRET,
      callbackURL: `http://localhost:${process.env.PORT}/auth/callback`,
      trelloParams: {
        scope: 'read,write',
        name: 'trello-clone',
        expiration: 'never',
      }
    },
    async (token: string, tokenSecret: string, _profile: any, cb: Function) => {
      try {
        // FIXME: _profile has me() in it so we don't need to call the API ourselves
        await tokenStore.set(token, tokenSecret);
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

  // allow users to be stored in / retrieved from the session
  passport.serializeUser((profile: object, cb) => cb(null, JSON.stringify(profile)));
  passport.deserializeUser((json: string, cb) => cb(null, JSON.parse(json)));

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
