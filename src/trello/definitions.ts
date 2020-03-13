export interface StringMap {
  [k: string]: string;
}

export enum CardFacet {
  attachments = "attachments",
  checklists = "checklists",
  comments = "comments",
  due = "due",
  labels = "labels",
  members = "members",
  stickers = "stickers",
  all = "all",
  none = "none",
}

export interface Board {
  id: string;
  name: string;
  labelNames: StringMap;
  memberships: any;
  url: string;
}

export interface Card {
  id: string;
}

export interface TrelloApi {
  me: () => Promise<any>;
  boards: () => Promise<Board[]>;
  lists: (boardId: string) => Promise<any[]>;
  archiveList: (listId: string) => Promise<void>;
  deleteAllCards: (boardId: string) => Promise<number>;
  cloneCard: (cardId: string, targetListId: string, cardFacets: CardFacet[]) => Promise<void>;
  createList: (boardId: string, name: string, pos?: any) => Promise<string>;
}
