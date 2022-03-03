import { Client as FaunaDBClient, query } from 'faunadb'

export const q = query

export const fauna = new FaunaDBClient({
  secret: process.env.FAUNA_KEY
})
