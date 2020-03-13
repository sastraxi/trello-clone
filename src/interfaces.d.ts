import { TrelloApi } from "./trello/definitions";

export interface User {
  id: string;
  token: string;
}

export interface Session {
  id: string;
  destroy(callback: (err) => void): void;
}

declare module 'http' {
  export interface IncomingMessage {
    user?: User;
    session: Session;
    trello?: TrelloApi;
  }
}
