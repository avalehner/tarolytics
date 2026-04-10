import 'dotenv/config' //loads environment variables when the server starts 
import { Express } from "express" //type only 
import readingsRouter from './routes/readings'
const express = require('express') //runtime value 

const app: Express = express() //creates app instance: the request handling logic, doesn't listen for network traffic. knows what to do with requests but doesn't handle any on its own 

app.listen(3000, ()=> {
  console.log('Server running on port 3000')
}) //actually creates the server and tells it to start listening on port 3000

app.use(express.json()) //this is the middle ware that parses incoming JSON request bodires from the fron end 

app.use('/api/readings', readingsRouter)