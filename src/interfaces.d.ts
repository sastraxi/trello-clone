import { TrelloApi } from "./util/trello-api";

export interface User {
  id: string
  token: string
}

export interface Session {
  id: string
  destroy(callback: (err: any) => void): void;
}

declare module 'http' {
  export interface IncomingMessage {
    user?: User
    session: Session
    trello?: TrelloApi
  }
}
