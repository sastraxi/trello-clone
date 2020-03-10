import Bottleneck from 'bottleneck';
import request from 'superagent';

const limiter = new Bottleneck({
  maxConcurrent: +process.env.LIMIT_MAX_CONCURRENT,
  minTime: +process.env.LIMIT_MIN_TIME_MS,
});

export const me = (token: string) => () =>
  request.get('https://api.trello.com/1/members/me')
    .query({
      key: process.env.TRELLO_KEY,
      token,
    })
    .then(r => r.body);

export const boards = (token: string) => () =>
  request.get('https://api.trello.com/1/members/me/boards')
    .query({
      key: process.env.TRELLO_KEY,
      token,
    })
    .then(r => r.body);

export interface TrelloApi {
  me: () => any,
  boards: () => any,
}

export default (token: string): TrelloApi => ({
  me: limiter.wrap(me(token)),
  boards: limiter.wrap(boards(token)),
});
