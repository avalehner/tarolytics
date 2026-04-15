import 'dotenv/config' //loads environment variables when the server starts 
import express, { Express } from "express" //type only 
import readingsRouter from './routes/readings'
import cardsRouter from './routes/cards'
import cors from 'cors'

const app: Express = express() //creates app instance: the request handling logic, doesn't listen for network traffic. knows what to do with requests but doesn't handle any on its own 

//middleware
app.use(express.json()) //parses incoming JSON request bodies from the front end
app.use(cors({ origin: 'http://localhost:5173'})) //tells express to only allow requests from the vite dev server

//routes
app.use('/api/readings', readingsRouter)
app.use('/api/cards', cardsRouter)

//server: actually creates the server and tells it to start listening on port 3000
app.listen(3000, ()=> {
  console.log('Server running on port 3000')
}) //actually creates the server and tells it to start listening on port 3000