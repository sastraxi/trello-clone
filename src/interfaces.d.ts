import { TrelloApi } from "./trello/definitions";

/*
export interface Session {
  id: string;
  destroy(callback: (err: any) => void): void;
}*/

declare global {
  namespace Express {
    interface User {
      id: string;
      token: string;
    }
  }
}
  
declare module 'http' {
  export interface IncomingMessage {
    trello?: TrelloApi;
  }
}
