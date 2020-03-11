import Bottleneck from 'bottleneck';
import request from 'superagent';

const limiter = new Bottleneck({
  maxConcurrent: +process.env.LIMIT_MAX_CONCURRENT,
  minTime: +process.env.LIMIT_MIN_TIME_MS,
});

export const get = async (url: string, query?: object) => {
  await limiter.schedule(() => Promise.resolve());
  if (!query) return request.get(url);
  return request.get(url).query(query);
};

export const put = async (url: string, query?: object) => {
  await limiter.schedule(() => Promise.resolve());
  if (!query) return request.put(url);
  return request.put(url).query(query);
};

export const post = async (url: string, query?: object) => {
  await limiter.schedule(() => Promise.resolve());
  if (!query) return request.post(url);
  return request.post(url).query(query);
};

export const del = async (url: string, query?: object) => {
  await limiter.schedule(() => Promise.resolve());
  if (!query) return request.delete(url);
  return request.delete(url).query(query);
};
