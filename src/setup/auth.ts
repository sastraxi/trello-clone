import passport from 'passport';
import OAuth1Strategy from 'passport-oauth1';
import pick from 'lodash.pick';

import TrelloApi from '../util/trello-api';
import { Store } from '../util/secret-store';
import { IRouter } from 'express';

const PROFILE_FIELDS = [
  'id',
  'username',
  'avatarUrl',
  'fullName',
];  

export default (app: IRouter, tokenStore: Store) => {
  // set up our integration with Trello, and define what happens when Trello redirects back to us
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
  app.get('/auth/login', passport.authenticate('oauth'));
  app.get('/auth/callback', 
    passport.authenticate('oauth', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });
};
