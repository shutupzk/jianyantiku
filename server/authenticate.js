import passport from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import jwt from 'jwt-simple'
import { ObjectId } from 'mongodb'
import nodeify from 'nodeify'
import bcrypt from 'bcrypt'

const KEY = '0.9434990896465933'

async function userFromPayload(request, jwtPayload) {
  console.log('jwtPayload', jwtPayload)
  if (!jwtPayload.userId) {
    throw new Error('No userId in JWT')
  }
  return request.context.User.findOneById(ObjectId(jwtPayload.userId))
}

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeader(),
      secretOrKey: KEY,
      passReqToCallback: true
    },
    (request, jwtPayload, done) => {
      nodeify(userFromPayload(request, jwtPayload), done)
    }
  )
)

export default function addPassport(app) {
  app.use(passport.initialize())

  app.post('/login', async (req, res, next) => {
    try {
      const { username, password } = req.body
      if (!username || !password) {
        throw new Error('Username or password not set on request')
      }
      const user = await req.context.User.collection.findOne({ phone: username })
      if (!user || !await bcrypt.compare(password, user.hash)) {
        throw new Error('User not found matching username/password combination')
      }
      const exp = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24
      const userId = user._id.toString()
      const payload = {
        userId,
        exp
      }
      const token = jwt.encode(payload, KEY)
      res.json({ token, userId })
    } catch (e) {
      next(e)
    }
  })

  app.post('/loginWithWechat', async (req, res, next) => {
    try {
      const { openId } = req.body
      if (!openId) {
        throw new Error('openId not set on request')
      }
      const user = await req.context.User.collection.findOne({ openId })
      if (!user) {
        throw new Error('User not found matching openId combination')
      }
      const exp = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24
      const userId = user._id.toString()
      const payload = {
        userId,
        exp
      }
      const token = jwt.encode(payload, KEY)
      res.json({ token, userId })
    } catch (e) {
      next(e)
    }
  })
}
