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
import { MONGO_URL } from '../config'
import router from './router'
import payment from './payment'

// import { initDB } from '../seed'

import moment from 'moment'
import later from 'later'
let schedule = later.parse.text('at 00:01 am')
let schedule01 = later.parse.text('at 01:57 am')
later.date.localTime()

const schema = makeExecutableSchema({ typeDefs, resolvers })

export async function startServer(GRAPHQL_PORT) {
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
  router(app)
  payment(app)

  app.use('/graphql', (req, res, next) => {
    // console.log('request ======= ' + GRAPHQL_PORT)
    // console.log(req.headers)
    passport.authenticate('jwt', { session: false }, (err, user, authError) => {
      // console.log('err, user', err, user)

      // if (!user) return res.json({ error: 'auth err' })
      graphqlExpress(() => {
        if (user) {
          const token = req.headers.authorization.replace('JWT ', '')
          if (token !== user.token) {
            return res.json({ errors: '请重新登录' })
          }
        }
        const query = req.query.query || req.body.query
        if (query && query.length > 20000) {
          throw new Error('Query too large.')
        }
        // console.log('auth user', err, user)
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

  later.setInterval(async () => {
    console.log('定时任务执行时间：', moment().format('YYYY-MM-DD HH:mm:ss'))
    try {
      const { User, UserMember, Member, UserExerciseTime, UserTimeAnswer, UserAnswer } = context
      let day = moment()
        .add(-2, 'days')
        .format('YYYY-MM-DD')
      let time = new Date(day).getTime()
      await UserExerciseTime.collection.deleteMany({ createdAt: { $lt: time } })
      await UserTimeAnswer.collection.deleteMany({ createdAt: { $lt: time } })
      await UserAnswer.collection.deleteMany({createdAt: { $lt: time }})
      const users = await User.collection.find({ memberId: { $exists: true, $ne: null } }).toArray()
      const today = moment().format('YYYY-MM-DD')
      for (let user of users) {
        const userMembers = await User.userMembers(user)
        let count = 0
        for (let member of userMembers) {
          count++
          const { months, effectTime } = member
          let endDate = moment(effectTime)
            .add(months, 'months')
            .format('YYYY-MM-DD')
          if (today > endDate || today === endDate) {
            await UserMember.updateById(member._id, { status: false })
            if (userMembers[count]) {
              const { code } = userMembers[count]
              const { _id } = await Member.collection.findOne({ code })
              await User.updateById(user._id, { memberId: _id })
              break
            } else {
              await User.updateById(user._id, { memberId: null })
            }
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  }, schedule)

  later.setInterval(async () => {
    console.log('定时插入习题id任务执行时间：', moment().format('YYYY-MM-DD HH:mm:ss'))
    try {
      const { ExerciseId, Exercise, ExaminationHasExercise } = context
      let exercises = await Exercise.collection.find({type: '01'}).toArray()
      let ids = []
      for (let { _id } of exercises) {
        ids.push(_id)
      }
      await ExaminationHasExercise.collection.deleteMany({})
      await ExerciseId.collection.deleteMany({})
      await ExerciseId.collection.findOneAndUpdate(
        {
          key: 1
        },
        {
          $set: {
            key: 1,
            ids
          }
        },
        { upsert: true }
      )
    } catch (e) {
      console.log(e)
    }
  }, schedule01)
}

// startServer()
//   .then(() => {
//     console.log('All systems go')
//   })
//   .catch(e => {
//     console.error('Uncaught error in startup')
//     console.error(e)
//   })
