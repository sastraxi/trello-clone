import { TrelloApi } from "./trello/definitions";

import { User as UserModel } from './db/user';

declare global {
  namespace Express {
    interface User extends UserModel {
      __phony: string; // FIXME: not sure how else to make this work
    }
  }
}
  
declare module 'http' {
  export interface IncomingMessage {
    trello?: TrelloApi;
  }
}
