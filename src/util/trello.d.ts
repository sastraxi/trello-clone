interface StringMap {
  [k: string]: string;
}

export interface Board {
  id: string,
  name: string,
  labelNames: StringMap,
  memberships: any,
  url: string,
}

export interface TrelloApi {
  me: () => Promise<any>,
  boards: () => Promise<Board[]>,
}
