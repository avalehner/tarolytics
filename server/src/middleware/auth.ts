import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  //browser is automatically sending the jwt on every request because it is stored as an httpOnly cookie. only need credentials: "include" in my getch calls to tell the browser to include my cookises in the request. client never knows the userid or passes it, its always derived from the verified cookie which is why its secure
  const token = req.cookies.authToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    //checks that the token is valid, returns the decoded payload with userId
    const decodedToken = jwt.verify(
      token,
      `${process.env.JWT_SECRET_KEY}`,
    ) as jwt.JwtPayload;

    (req as any).userId = decodedToken.userId;

    next(); //"i'm done move onto the next route handler"
  } catch {
    //not binding the error to a variable because we dont care specifically what went wrong, no conditional logic that depends on that
    //we dont want to expose the jwt internals to the client
    res.status(401).json({ error: "Invalid token" });
  }
};
