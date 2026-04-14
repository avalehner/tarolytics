
import { Router, Request, Response } from "express"
import pool from "../db"

const cardsRouter = Router()

//routes
cardsRouter.get('/:readingId', async (req: Request, res: Response) => {
  try {
    const dbResponse = await pool.query(`
      SELECT * 
      FROM readings 
      WHERE reading_id =$1`)
    const cardData = dbResponse.rows[0]
    res.status(200)
      .json(cardData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})
 
//route outline 

//[routerName].[method] ('filepath', (req: type(optional), res: type(optional)) => {
  // try {
    //const dbResponse = await pool.query('SQL query')
    //const dataName = dbResponse.rows[add 0 if only returning one thing]
    //res.status(200)
      //.json(dataName)
  //} catch (error) {
    //const message = error instance of Error ? error.message : 'Unknown Error' (typescript only)
    //res.status(500)
      //.json({ error:message })
  //}
//})

export default cardsRouter

