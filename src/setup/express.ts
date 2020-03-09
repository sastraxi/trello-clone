
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';

export default () => {
	const app = express();

	app.use(session({
    name: 'sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 120,
    },
    rolling: true,
	}));

	app.use(
    cors({
      origin: true,
      credentials: true,
    }),
	);

	app.use(bodyParser.text({ type: "*/*" }));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	return app;
};
