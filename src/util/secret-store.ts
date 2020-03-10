interface StringMap {
  [k: string]: string;
}

export interface Store {
  set: (key: string, secret: string) => Promise<void>,
  get: (key: string) => Promise<string>,
  remove: (key: string) => Promise<boolean>,
}

export default (storeName: string): Store => {
  const store: StringMap = {};
  return {
    set: (key: string, secret: string): Promise<void> => {
      store[key] = secret;
      return Promise.resolve();
    },
    get: (key: string): Promise<string> => {
      return Promise.resolve(store[key]);
    },
    remove: (key: string): Promise<boolean> => {
      if (!(key in store)) {
        return Promise.resolve(false);
    }

    delete store[key];
    return Promise.resolve(true);
    },
  };
};
