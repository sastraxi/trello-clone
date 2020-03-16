import { Db, ObjectId } from 'mongodb';
import { Board } from '../trello/definitions';
import { Moment } from 'moment';

const COLLECTION = 'monitor';

export interface Monitor {
  id: string;
  userId: string; // who created this monitor
  webhookId: string;
  board: Board;
  delaySeconds: number; // how many seconds into the future to schedule the sync
  scheduledAt: Date;
}

const DEFAULT_DELAY_SECONDS = 600; // 10 minutes

const fromDb = ({ _id, ...doc }: any): Monitor => ({
  id: _id,
  ...doc,
});

export default (db: Db) => ({
  setup: async (): Promise<any> => {
    await db.collection(COLLECTION).createIndex({ webhookId: 1 }, { unique: true });
    await db.collection(COLLECTION).createIndex({ "board.id": 1 });
    return db.collection(COLLECTION).createIndex({ scheduledAt: 1 });
  },

  findByBoard: (boardId: string): Promise<Monitor> =>
    db.collection(COLLECTION)
      .findOne({ "board.id": boardId })
      .then(fromDb),

  find: (webhookId: string): Promise<Monitor> =>
    db.collection(COLLECTION)
      .findOne({ webhookId })
      .then(fromDb),

  all: (): Promise<Monitor[]> =>
    db.collection(COLLECTION)
      .find()
      .toArray()
      .then(docs => docs.map(fromDb)),

  create: async (
    userId: string,
    webhookId: string,
    board: Board,
    delaySeconds: number = DEFAULT_DELAY_SECONDS
  ): Promise<Monitor> => {
    // TODO: is there a better place for these createindex calls?
    const r = await db.collection(COLLECTION)
      .insertOne({
        userId,
        webhookId,
        board,
        delaySeconds,
        scheduledAt: null,
      });
    return {
      id: r.insertedId,
      userId,
      webhookId,
      board,
      delaySeconds,
      scheduledAt: null,
    };
  },

  /**
   * The board this monitor is watching has just been updated;
   * schedule a sync for some time in the future
   */
  schedule: async (id: string, scheduledAt: Moment): Promise<any> => 
    db.collection(COLLECTION)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { scheduledAt: scheduledAt.toDate() } }
      ),

  due: async (): Promise<Monitor[]> =>
    db.collection(COLLECTION)
      .find({ scheduledAt: { "$lte": new Date() } })
      .toArray()
      .then(docs => docs.map(fromDb)),

  delete: async (id: string): Promise<boolean> => {
    const { deletedCount } = await db.collection(COLLECTION)
      .deleteOne({
        _id: new ObjectId(id)
      });
    return deletedCount === 1;
  },
});
