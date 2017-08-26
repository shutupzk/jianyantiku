import express from 'express'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
// import { SubscriptionServer } from 'subscriptions-transport-ws'
import bodyParser from 'body-parser'
import { makeExecutableSchema } from 'graphql-tools'
import { printSchema } from 'graphql/utilities/schemaPrinter'
import { MongoClient } from 'mongodb'
import cors from 'cors'
import passport from 'passport'

import typeDefs from '../schema'
import resolvers from '../resolvers'
import addModelsToContext from '../model'

import authenticate from './authenticate'
import { GRAPHQL_PORT, MONGO_URL } from '../config'

import { initDB } from '../seed'

const schema = makeExecutableSchema({ typeDefs, resolvers })

async function startServer() {
  const db = await MongoClient.connect(MONGO_URL)
  const context = addModelsToContext({ db })
  const app = express().use('*', cors())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())

  app.use((req, res, next) => {
    req.context = context
    next()
  })

  authenticate(app)

  app.use('/graphql', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, authError) => {
      // if (!user) return res.json({ error: 'auth err' })
      graphqlExpress(() => {
        const query = req.query.query || req.body.query
        if (query && query.length > 20000) {
          throw new Error('Query too large.')
        }
        console.log('auth user', err, user)
        return {
          schema,
          context: Object.assign({ user }, req.context),
          debug: true,
          formatError: e => {
            console.log(e)
            return { message: e.message }
          }
        }
      })(req, res, next)
    })(req, res, next)
  })

  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql'
    })
  )

  app.use('/schema', (req, res) => {
    res.set('Content-Type', 'text/plain')
    res.send(printSchema(schema))
  })

  app.listen(GRAPHQL_PORT, () => console.log(`GraphQL server launched, visit http://localhost:${GRAPHQL_PORT}/graphiql`))
}

initDB(MONGO_URL, function() {
  startServer()
    .then(() => {
      console.log('All systems go')
    })
    .catch(e => {
      console.error('Uncaught error in startup')
      console.error(e)
    })
})
