import { Db, ObjectId } from 'mongodb';

const COLLECTION = 'user';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  username: string;
  avatarUrl?: string;
  token: string;
  tokenSecret: string;
}

const toDb = ({ id, ...restUser }: User): object => ({
  _id: new ObjectId(id),
  ...restUser,
});

const fromDb = ({ _id, ...restUser }: any): User => ({
  id: _id,
  ...restUser,
});

export default (db: Db) => ({
  setup: async (): Promise<any> => {
    await db.collection(COLLECTION).createIndex({ email: 1 }, { sparse: true });
    return db.collection(COLLECTION).createIndex({ scheduledAt: 1 });
  },

  find: (id: string): Promise<User> =>
    db.collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) })
      .then(fromDb),

  count: (): Promise<number> =>
    db.collection(COLLECTION)
      .count(),

  create: async (user: User): Promise<User> => {
    await db.collection(COLLECTION).insertOne(toDb(user));
    return user;
  },

  delete: async (webhookId: string): Promise<boolean> => {
    const { deletedCount } = await db.collection(COLLECTION).deleteOne({ webhookId });
    return deletedCount === 1;
  },
});
