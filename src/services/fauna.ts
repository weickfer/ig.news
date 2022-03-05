import { Client as FaunaDBClient, query } from 'faunadb'

export const q = query

export const faunaClient = new FaunaDBClient({
  secret: process.env.FAUNA_KEY
})
