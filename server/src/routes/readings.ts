import { Router, Request, Response } from "express"
import pool from "../db"

//create router instance 
const router = Router()

//different kinds of routes: 
//get - fetches data, never modifies anything  
//post - creates a new record 
//put - updates an existing record (replaces the whole record)
//path -updates an existing record (only updates specific fields) 
//delete - deletes a record 

//notes: 
//1. res is the response obkect, its what you send back to whoever made the request (in this case the react frontend)
//2. .json() sends data back as a json format 
//3. when something goes wrong in a try block JS automatically creates an error obkect describing what went wrong nd passes it to catch. contains error.message so we know what went wrong

//create routes 
router.get('/', async (req: Request, res: Response) => { // '/' is the route path, means the root of whatever patht the router is mounted on 
  try {
    const result = await pool.query ('SELECT * FROM readings')
    res.json(result.rows)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error' //checls if error is an error object, if it is we can access the error message, if not itll say 'Unknown error' since he dont know what was thrown. 
    res.status(500).json({ error: message }) //status(500) means server error 
  } //{ error } shorthand for { error: error }
})

export default router 