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

export interface Webhook {
  id: string;
  callbackURL: string;
  description: string;
}

export interface WebhookRequestBody {
  action: {
    id: string;
    idMemberCreator: string;
    data: {
      board: {
        name: string;
        id: string;
      };
    };
    type: string;
    date: string;
    memberCreator: {
      id: string;
      avatarHash: string;
      fullName: string;
      initials: string;
      username: string;
    };
  };
  model: {
    id: string;
  };
}

export interface TrelloApi {
  me: () => Promise<any>;

  boards: () => Promise<Board[]>;

  deleteAllCards: (boardId: string) => Promise<number>;
  cloneCard: (cardId: string, targetListId: string, cardFacets: CardFacet[]) => Promise<void>;
  
  lists: (boardId: string) => Promise<any[]>;
  createList: (boardId: string, name: string, pos?: any) => Promise<string>;
  archiveList: (listId: string) => Promise<void>;

  webhooks: () => Promise<Webhook[]>;
  createWebhook: (boardId: string, description?: string) => Promise<string>;
  deleteWebhook: (webhookId: string) => Promise<any>;
  setWebhookActive: (webhookId: string, active: boolean) => Promise<any>;
}
