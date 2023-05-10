/* eslint-disable import/no-unresolved */
import cors from 'cors';
import dotenv from 'dotenv';
import express, { json } from 'express';
import jwt from 'express-jwt';

import { User as UserType } from '../../shared/types';
import { generateData } from './db-func/generateData/index';
import { validateUser } from './middlewares/index';
import bandRoutes from './route-methods/bands';
import showRoutes from './route-methods/shows';
import userRoutes from './route-methods/users';

dotenv.config();
if (!process.env.EXPRESS_SECRET) {
  console.error('EXPRESS_SECRET must be defined in .env\nEXITING.');
  process.exit(-1);
}

declare global {
  namespace Express {
    interface Request {
      auth?: UserType;
    }
  }
}

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.static('public'));

app.use(json());

app.use(
  '/user/:id',
  jwt({
    secret: process.env.EXPRESS_SECRET || 'NOT SO SECRET',
    algorithms: ['HS256'],
    requestProperty: 'auth',
  }),
);
app.use('/user/:id', validateUser);

app.post('/signin', userRoutes.auth);

app.get('/user/:id', userRoutes.getById);
app.delete('/user/:id', userRoutes.remove);
app.patch('/user/:id', userRoutes.update);

app.post('/user', userRoutes.create);

app.get('/bands/:id', bandRoutes.getById);

app.get('/shows', showRoutes.get);
app.get('/shows/:id', showRoutes.getById);

app.patch('/shows/:showId/hold/:holdId', showRoutes.hold);
app.patch('/shows/:showId/purchase/:purchaseId', showRoutes.purchase);
app.patch('/shows/:showId/release/:holdId', showRoutes.release);
app.patch('/shows/:showId/cancelPurchase/:purchaseId', showRoutes.release);


export const startUp = async (): Promise<void> => {
  await generateData();

  app.listen(3030, () =>
    console.log('Concert venue server listening on port 3030!'),
  );
};

export default app;
