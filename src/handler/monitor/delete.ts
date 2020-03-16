import { Request, Response } from "express-serve-static-core";

export default async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  res.status(400).send(`Need to delete ${id}, but this endpoint isn't implemented yet!`);
};
