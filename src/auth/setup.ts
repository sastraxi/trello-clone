import { Application, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as TrelloStrategy } from 'passport-trello';

import deployedUrl from '../util/url';
import getMongoClient from '../util/mongo-client';

import UserModel, { User } from '../db/user';
import InviteCodeModel from '../db/invite-code';

const USER_WAS_INVITED_KEY = 'used_invite_code';

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
      },
      passReqToCallback: true,
    },
    async (req: Request, token: string, tokenSecret: string, profile: any, cb: Function) => {
      try {
        const client = await getMongoClient();
        try {
          const db = client.db();
          const Users = UserModel(db);
          const InviteCode = InviteCodeModel(db);

          const user: User = {
            id: profile._json.id,
            email: profile._json.email,
            fullName: profile._json.fullName,
            username: profile._json.username,
            avatarUrl: profile._json.avatarUrl,
            token,
            tokenSecret,
          };          

          // once any invite code exists, require a valid one
          const isReturning = await Users.exists(user.id);
          if (!isReturning) {
            const numInviteCodes = await InviteCode.count();
            if (numInviteCodes > 0 && !req.session[USER_WAS_INVITED_KEY]) {
              console.error('User was not invited');
              return cb("You must be invited to join this app!");
            }
            if (numInviteCodes === 0) {
              await InviteCode.generate();
            }
          }
          
          cb(null, await Users.upsert(user));
        } catch (err) {
          console.error('could not create user', err);
          cb(err);
        } finally {
          client.close();
        }
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
      cb(null, await User.find(userId));
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

  // consume invite route
  app.get('/i/:code', async (req, res): Promise<Response | void> => {
    const { code } = req.params;
    const client = await getMongoClient();
    try {
      const db = client.db();
      const InviteCode = InviteCodeModel(db);
      const isValid = await InviteCode.isValid(code);
      if (!isValid) {
        return res.status(400).send('Invalid invite code!');
      }
      req.session[USER_WAS_INVITED_KEY] = code; // checked upon returning from trello
      return res.redirect('/');
    } catch (err) {
      console.error(`/i/${code}`, err);
      res.status(500).send('could not consume invite code');
    } finally {
      client.close();
    }
  });
};
