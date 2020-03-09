interface Store {
	[k: string]: string;
}

export default (storeName: string) => {
	const store: Store = {};
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
