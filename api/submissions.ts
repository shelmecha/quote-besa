import express, { Request, Response } from 'express';
import { apiRouter } from '../server/api.js';

const app = express();
app.use(express.json());

app.use('/api', apiRouter);
app.use('/', apiRouter);

export default function handler(req: Request, res: Response) {
  return app(req, res);
}
