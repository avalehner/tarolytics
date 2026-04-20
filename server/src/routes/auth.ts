import { Router, Request, Response } from "express"
import pool from "../db"

const authRouter = Router()

//https://accounts.google.com/o/oauth2/v2/auth?client_id=1077733341313-vqnfgd3beqnrlqrk2oet76tu0p7ucf9p.apps.googleusercontent.com&redirect_uri=http://localhost:3000/auth/google/callback&response_type=code&scope=email 

//send to google auth url 
authRouter.get('/google', async (req: Request, res: Response) => {
  try {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=http://localhost:3000/auth/google/callback&response_type=code&scope=profile%20email`
    
    res.redirect(url)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    res.status(500)
      .json({ error: message })
  }
})

//callback route send code to google in exchange for access token (server to server)
authRouter.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const authenticationCode = req.query.code as string

    const googleResponse = await fetch (`https://oauth2.googleapis.com/token`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded'}, 
      body: new URLSearchParams({
        'code': `${authenticationCode}`, 
        'client_id': `${process.env.GOOGLE_OAUTH_CLIENT_ID}`, 
        'redirect_uri': `http://localhost:3000/auth/google/callback`, 
        'grant_type': 'authorization_code'
      })
    })

    if (!googleResponse.ok) throw new Error(`Auth server error: ${googleResponse.status}`)
    
    const googleObj = await googleResponse.json()
    const userInfoResponse = await fetch(`https://openidconnect.googleapis.com/v1/userinfo`, { //end point will return user name, picture, and email
      method: 'GET', 
      headers: {'Authorization': `Bearer ${googleObj.access_token}`}
    })

    const userInfo = await userInfoResponse.json()

    const {sub, given_name, family_name, picture, email, name} = userInfo

    const dbResponse = await pool.query(`
      INSERT INTO users (google_id, full_name, first_name, last_name, email, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT(google_id) DO UPDATE 
      RETURNING *;`,
      [sub, name, given_name, family_name, email, picture]
    )

    const userData = dbResponse.rows[0]
  

    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Error'
    res.status(500)
      .json({ error: message })
  } 
})

export default authRouter