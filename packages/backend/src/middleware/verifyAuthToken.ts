import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface IAuthTokenPayload {
  username: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: IAuthTokenPayload;
  }
}

export function verifyAuthToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return void res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, req.app.locals.JWT_SECRET as string, (error, decoded) => {
    if (error || !decoded) {
      return void res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded as IAuthTokenPayload;
    next();
  });
}
