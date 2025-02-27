import { NextFunction, Request, Response } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    success: false,
    message: "We think you are lost your track! Please check your URL."
  });
};
