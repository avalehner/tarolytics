import "dotenv/config"; //loads environment variables when the server starts for entire app
import express, { Express } from "express"; //type only
import readingsRouter from "./routes/readings";
import cardsRouter from "./routes/cards";
import authRouter from "./routes/auth";
import randomRouter from "./routes/random";
import citiesRouter from "./routes/cities";
import usersRouter from "./routes/users";
import cookieParser from "cookie-parser";
import cors from "cors";
import astrologyRouter from "./routes/astrology";
import analyticsRouter from "./routes/analytics";

const app: Express = express(); //creates app instance: the request handling logic, doesn't listen for network traffic. knows what to do with requests but doesn't handle any on its own

//middleware
app.use(express.json()); //parses incoming JSON request bodies from the front end (only does this if req has a body)
app.use(cors({ origin: `${process.env.CLIENT_URL}`, credentials: true })); //tells express to only allow requests from the vite dev server, credentials true for cookie parser
app.use(cookieParser());

//routes
app.use("/api/readings", readingsRouter);
app.use("/api/cards", cardsRouter);
app.use("/auth", authRouter);
app.use("/api/random", randomRouter);
app.use("/api/cities", citiesRouter);
app.use("/api/users", usersRouter);
app.use("/api/astrology", astrologyRouter);
app.use("/api/analytics", analyticsRouter);

//server: actually creates the server and tells it to start listening on port 3000

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); //actually creates the server and tells it to start listening on port 3000
