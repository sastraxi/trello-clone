export interface StringMap {
  [k: string]: string;
}

export enum CardFacet {
  Attachments = "attachments",
  Checklists = "checklists",
  Comments = "comments",
  Labels = "labels",
  All = "all",
  None = "none",
}

export interface Board {
  id: string,
  name: string,
  labelNames: StringMap,
  memberships: any,
  url: string,
}

export interface Card {
  id: string,
}

export interface TrelloApi {
  me: () => Promise<any>,
  boards: () => Promise<Board[]>,
  lists: (boardId: string) => Promise<any[]>,
  archiveList: (listId: string) => Promise<void>,
  deleteAllCards: (boardId: string) => Promise<number>,
  cloneCard: (cardId: string, targetListId: string, cardFacets: CardFacet[]) => Promise<void>,
  createList: (boardId: string, name: string, pos?: any) => Promise<string>,
}
