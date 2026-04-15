
import { Router, Request, Response } from "express"
import pool from "../db"

const cardsRouter = Router()

//routes

//get all cards 
cardsRouter.get('/', async (req:Request, res:Response) => {
  try {
    const dbResponse = await pool.query(`
      SELECT *
      FROM cards; 
    `)
    const cardsData = dbResponse.rows 
    res.status(200)
      .json(cardsData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})

//get all cards 
cardsRouter.get('/', async (req:Request, res:Response) => {
  try {
    const dbResponse = await pool.query(`
      SELECT *
      FROM cards; 
    `)
    const cardsData = dbResponse.rows 
    res.status(200)
      .json(cardsData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})

cardsRouter.post('/', async (req:Request, res: Response) => {
  try {
    const { reading_id, card_name, position_name, position_order } = req.body
    const dbResponse = await pool.query(`
      INSERT INTO cards (reading_id, card_name, position_name, position_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *;`, 
      [reading_id, card_name, position_name, position_order]
    )
    const cardData = dbResponse.rows[0]
    res.status(200)
      .json(cardData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({error: message})
  }
})

cardsRouter.patch('/:cardId', async (req:Request, res: Response) => {
  try{
    const { card_name } = req.body
    const { cardId } = req.params
    const dbResponse = await pool.query(`
        UPDATE cards 
        set card_name = $1
        WHERE id = $2
        RETURNING *;`, 
        [card_name, cardId]
      )
    const updatedCard = dbResponse.rows[0]
    res.status(201)
      .json(updatedCard)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})

//delete specific card
cardsRouter.delete('/:cardId', async (req: Request, res: Response) => {
  try{
    const { cardId } = req.params 
    const dbResponse = await pool.query(`
      DELETE FROM cards
      WHERE id = $1 
      RETURNING *;`, 
      [cardId]
    ) 
    const deletedCard = dbResponse.rows[0]
    res.status(200)
      .json(deletedCard)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})

//delete all cards in a reading (once reading has veen deleted)
cardsRouter.delete('/reading/:readingId', async (req: Request, res: Response) => { //need reading in front of /:readingId so that express can tell two delete paths apart
  try {
    const { readingId } = req.params 
    const dbResponse = await pool.query(`
      DELETE FROM cards 
      WHERE reading_id = $1
      RETURNING *;`, 
      [readingId]
    )
    const deletedCards = dbResponse.rows
    res.status(200)
      .json(deletedCards)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})

export default cardsRouter

//route outline 

//[routerName].[method] ('/filepath:/[params]', (req: type(optional), res: type(optional)) => {
  // try {
    //if sending data gotta deconstruct request object or parameter obk: const { item, item, item } = req.body
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

