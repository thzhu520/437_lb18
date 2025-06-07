import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CredentialsProvider } from "../CredentialsProvider";

interface IAuthTokenPayload {
    username: string;
}

function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const payload: IAuthTokenPayload = {
            username
        };
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

export function registerAuthRoutes(app: express.Application, credentialsProvider: CredentialsProvider) {
    
    // POST /auth/register - Register new user
    app.post("/auth/register", async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, password } = req.body;

            // Validate request body
            if (!username || !password || typeof username !== "string" || typeof password !== "string") {
                res.status(400).send({
                    error: "Bad request",
                    message: "Missing username or password"
                });
                return;
            }

            console.log(`📝 Registration attempt for user: ${username}`);

            // Try to register the user
            const success = await credentialsProvider.registerUser(username, password);
            
            if (!success) {
                res.status(409).send({
                    error: "Conflict",
                    message: "Username already taken"
                });
                return;
            }

            console.log(`✅ User ${username} registered successfully`);
            res.status(201).send(); // Created, no body

        } catch (error) {
            console.error("❌ Registration error:", error);
            res.status(500).send({
                error: "Internal Server Error",
                message: "Failed to register user"
            });
        }
    });

    // POST /auth/login - Login user
    app.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, password } = req.body;

            // Validate request body
            if (!username || !password || typeof username !== "string" || typeof password !== "string") {
                res.status(400).send({
                    error: "Bad request",
                    message: "Missing username or password"
                });
                return;
            }

            console.log(`🔐 Login attempt for user: ${username}`);

            // Verify password
            const isValid = await credentialsProvider.verifyPassword(username, password);
            
            if (!isValid) {
                console.log(`❌ Invalid login for user: ${username}`);
                res.status(401).send({
                    error: "Unauthorized",
                    message: "Incorrect username or password"
                });
                return;
            }

            // Generate JWT token
            const token = await generateAuthToken(username, req.app.locals.JWT_SECRET);
            
            console.log(`✅ User ${username} logged in successfully`);
            res.json({ token });

        } catch (error) {
            console.error("❌ Login error:", error);
            res.status(500).send({
                error: "Internal Server Error",
                message: "Failed to login"
            });
        }
    });
}