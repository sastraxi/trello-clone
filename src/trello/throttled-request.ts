import Bottleneck from 'bottleneck';
import request from 'superagent';

const TRELLO_API_BASE = "https://api.trello.com";

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

export const get = async (path: string, query?: object) => {
  const url = makeUrl(path);
  await limiter.schedule(() => Promise.resolve());
  if (!query) return request.get(url);
  return request.get(url).query(query);
};

export const put = async (path: string, query?: object) => {
  const url = makeUrl(path);
  await limiter.schedule(() => Promise.resolve());
  if (!query) return request.put(url);
  return request.put(url).query(query);
};

export const post = async (path: string, query?: object) => {
  const url = makeUrl(path);
  await limiter.schedule(() => Promise.resolve());
  if (!query) return request.post(url);
  return request.post(url).query(query);
};

export const del = async (path: string, query?: object) => {
  const url = makeUrl(path);
  await limiter.schedule(() => Promise.resolve());
  if (!query) return request.delete(url);
  return request.delete(url).query(query);
};
