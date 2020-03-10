interface StringMap {
  [k: string]: string;
}

export interface Board {
  id: string,
  name: string,
  labelNames: StringMap,
}

export interface TrelloApi {
  me: () => Promise<any>,
  boards: () => Promise<Board[]>,
}
