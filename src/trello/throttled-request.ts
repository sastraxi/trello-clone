import Bottleneck from 'bottleneck';
import request, { Response } from 'superagent';

const TRELLO_API_BASE = "https://api.trello.com";
const MAX_RETRIES = 3;

const limiter = new Bottleneck({
  maxConcurrent: +process.env.LIMIT_MAX_CONCURRENT,
  minTime: +process.env.LIMIT_MIN_TIME_MS,
});

const makeUrl = (path: string) => {
  if (!path.startsWith('/')) {
    throw new Error(`The path ${path} does not start with a slash!`);
  }
  return `${TRELLO_API_BASE}${path}`;
};

const retry = (currentRetry: number, cb: () => Promise<any>) =>
  (err: Response) => {
    if (err.status !== 429) throw err;
    if (currentRetry > MAX_RETRIES) {
      console.error(`Retried ${MAX_RETRIES} times but couldn't get a non-429; aborting.`);
      throw err;
    }
    console.error('Rate limited; retrying soon', err.body);
    return cb();
  };

export const get = async (path: string, query?: object, currentRetry = 0) => {
  const url = makeUrl(path);
  await limiter.schedule(() => Promise.resolve());

  const retryHandler = retry(currentRetry, () => get(path, query, currentRetry + 1));  
  if (!query) return request.get(url).catch(retryHandler);
  return request.get(url).query(query).catch(retryHandler);
};

export const put = async (path: string, query?: object, currentRetry = 0) => {
  const url = makeUrl(path);
  await limiter.schedule(() => Promise.resolve());

  const retryHandler = retry(currentRetry, () => put(path, query, currentRetry + 1));
  if (!query) return request.put(url).catch(retryHandler);
  return request.put(url).query(query).catch(retryHandler);
};

export const post = async (path: string, query?: object, currentRetry = 0) => {
  const url = makeUrl(path);
  await limiter.schedule(() => Promise.resolve());

  const retryHandler = retry(currentRetry, () => post(path, query, currentRetry + 1));
  if (!query) return request.post(url).catch(retryHandler);
  return request.post(url).query(query).catch(retryHandler);
};

export const del = async (path: string, query?: object, currentRetry = 0) => {
  const url = makeUrl(path);
  await limiter.schedule(() => Promise.resolve());

  const retryHandler = retry(currentRetry, () => del(path, query, currentRetry + 1));
  if (!query) return request.delete(url).catch(retryHandler);
  return request.delete(url).query(query).catch(retryHandler);
};
