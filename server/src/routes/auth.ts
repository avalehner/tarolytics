import { Router, Request, Response } from "express"
import pool from "../db"
import jwt from "jsonwebtoken"

const authRouter = Router()

//https://accounts.google.com/o/oauth2/v2/auth?client_id=1077733341313-vqnfgd3beqnrlqrk2oet76tu0p7ucf9p.apps.googleusercontent.com&redirect_uri=http://localhost:3000/auth/google/callback&response_type=code&scope=email 

//browser navigations are always get requests

//routes: how my backend server recieves incoming requests. when called at that specific path it executes some code 
//fetch: how you send outgoing requests to another server. its a tool for making http requests 

//send user to google auth url, returns user to a url with a code  
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

//callback route: send code to google in exchange for access token (server to server)
authRouter.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const authenticationCode = req.query.code as string //get code from url 

    const googleResponse = await fetch (`https://oauth2.googleapis.com/token`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded'}, 
      body: new URLSearchParams({
        'code': `${authenticationCode}`, 
        'client_id': `${process.env.GOOGLE_OAUTH_CLIENT_ID}`, 
        'redirect_uri': `http://localhost:3000/auth/google/callback`, 
        'grant_type': 'authorization_code', 
        'client_secret': `${process.env.GOOGLE_OAUTH_CLIENT_SECRET}`
      })
    }) 

    if (!googleResponse.ok) throw new Error(`Auth server error: ${googleResponse.status}`)
    const googleObj = await googleResponse.json() //contains access token 

    const userInfoResponse = await fetch(`https://openidconnect.googleapis.com/v1/userinfo`, { //end point will return user name, picture, and email
      method: 'GET', 
      headers: {'Authorization': `Bearer ${googleObj.access_token}`}
    })

    if (!userInfoResponse.ok) throw new Error(`Auth server error: ${userInfoResponse.status}`)
    const userInfo = await userInfoResponse.json() //object with users info 

    //insert user info to db 
    const { sub, name, given_name, family_name, email, picture } = userInfo
    const dbResponse = await pool.query(`
      INSERT INTO users (google_id, full_name, first_name, last_name, email, profile_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (google_id) 
      DO UPDATE SET 
            full_name = EXCLUDED.full_name, 
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            profile_url = EXCLUDED.profile_url
      RETURNING *;`,
      [sub, name, given_name, family_name, email, picture]
    )
    //ON CONFLICT DO UPDATE updates the existing row that conflicts with the row proposed for insertion 
    const userData = dbResponse.rows[0]
    
    //takes in 3 arguments: payload (where userData.id goes), secret (from .env file), and options object where i set the expiry. returns a token string 
    const token = jwt.sign( { userId: userData.id }, `${process.env.JWT_SECRET_KEY}`,{
      algorithm: 'HS256', 
      expiresIn: '7d'
    } )

    //attach jwt cookie to the response. browser recieves cookie in res headers and stores it automatically
    res.cookie( 'authToken', `${token}`, {
      httpOnly: true, 
      sameSite: 'lax', 
      secure: false //false for local development (HTTP)
    })
  
    res.redirect('http://localhost:5173/')

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Error'
    res.status(500)
      .json({ error: message })
  } 
})

authRouter.get('/me', async (req: Request, res: Response) => {
  const token = req.cookies.authToken 
  if (!token) return res.status(401) // if no token return error 
    .json({ error: 'Unauthorized' }) //sends json repsonse body
  
  try {
    const decoded = jwt.verify(token, `${process.env.JWT_SECRET_KEY}`) //decodes the token and returns the payload which contains the userid 
    const { userId } = decoded as jwt.JwtPayload //casts result so typescript knows what type it is and i can access userId 

    const dbReponse = await pool.query(`
      SELECT * 
      FROM users 
      WHERE id=$1;`, 
      [userId]
    )
    const userData = dbReponse.rows[0]
    
    res.status(200)
      .json(userData)

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(401)
      .json({ error: message })
  }
})
 

authRouter.get('/logout', async (req: Request, res: Response) => {
  res.clearCookie('authToken') //clears jwt token
  res.redirect('http://localhost:5173/login') //redirects to login page
})

export default authRouter