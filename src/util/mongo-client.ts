import { MongoClient } from 'mongodb';

// generate database URL from environment
export const databaseUrl = process.env.MONGODB_URI ||
  `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}` +
    `@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;

export const connectionOptions = {
  authSource: process.env.MONGO_AUTH_DATABASE,
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

export default (): Promise<MongoClient> =>
  MongoClient.connect(databaseUrl, connectionOptions);
