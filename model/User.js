import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'
import bcrypt from 'bcrypt'
import { checkPhoneNumber } from '../utils'
const SALT_ROUNDS = 10

export default class User {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('user')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection.find().sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
  }

  exerciseCollects(user, { skip = 0, limit = 10 }) {
    return this.context.ExerciseCollect.collection.find({
      userId: user._id
    }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
  }

  userAnswers(user, { skip = 0, limit = 10 }) {
    return this.context.UserAnswer.collection.find({
      userId: user._id
    }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
  }

  async insert(doc) {
    if (!checkPhoneNumber(doc.phone)) throw new Error('手机号格式不正确')
    let user = await this.collection.findOne({ phone: doc.phone })
    if (user) throw new Error('手机号已被注册')
    const hash = await bcrypt.hash(doc.password, SALT_ROUNDS)
    delete doc.password
    const docToInsert = Object.assign({}, doc, {
      hash,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    const id = (await this.collection.insertOne(docToInsert)).insertedId
    return id
  }

  async updateById(id, doc) {
    let updateSet = {
      updatedAt: Date.now()
    }
    if (doc.password) {
      const hash = await bcrypt.hash(doc.password, SALT_ROUNDS)
      delete doc.password
      updateSet.hash = hash
    }
    if (doc.openId) {
      updateSet.openId = doc.openId
    }
    const ret = await this.collection.update(
      { _id: id },
      {
        $set: Object.assign({}, doc, updateSet)
      }
    )
    this.loader.clear(id)
    return ret
  }

  async removeById(id) {
    const ret = this.collection.remove({ _id: id })
    this.loader.clear(id)
    return ret
  }
}