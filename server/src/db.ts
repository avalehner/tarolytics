import { Pool } from "pg" //collection of multiple connections to the database that are kept open and ready for use

const pool = new Pool({
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD, 
  host: process.env.DB_HOST, 
  port: Number(process.env.DB_PORT), 
  database: process.env.DB_NAME, 
})

export default pool 