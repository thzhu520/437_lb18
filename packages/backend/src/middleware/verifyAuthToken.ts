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

export function verifyAuthToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).end();
    }

    jwt.verify(token, req.app.locals.JWT_SECRET as string, (error, decoded) => {
        if (error || !decoded) {
            return res.status(403).end();
        }

        req.user = decoded as IAuthTokenPayload;
        next();
    });
}