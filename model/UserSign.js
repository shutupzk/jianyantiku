import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'
import moment from 'moment'
import { getInsertId } from '../utils'

export default class UserSign {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('userSign')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  user(userSign) {
    return this.context.User.findOneById(userSign.userId)
  }

  async insert(doc) {
    const { ScoreRecord } = this.context
    const { userId } = doc
    let count = 1
    let date = moment().format('YYYY-MM-DD')
    let yesterday = moment()
      .add(-1, 'days')
      .format('YYYY-MM-DD')
    let lastSign = await this.collection.find({ userId, date: yesterday })
    if (lastSign) {
      if (count === 30) {
        count = 1
      } else {
        count = lastSign.count + 1
      }
    }
    const docToInsert = Object.assign({}, doc, {
      date,
      count,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    let upsertResult = await this.collection.findOneAndUpdate({ userId, date }, docToInsert, { upsert: true })
    const { value } = upsertResult
    if (value) {
      ScoreRecord.autoInsert({ userId, code: '5' })
      if (count === 5) {
        ScoreRecord.autoInsert({ userId, code: '6' })
      }
      if (count === 10) {
        ScoreRecord.autoInsert({ userId, code: '7' })
      }
      if (count === 20) {
        ScoreRecord.autoInsert({ userId, code: '8' })
      }
      if (count === 30) {
        ScoreRecord.autoInsert({ userId, code: '9' })
      }
    }
    const id = getInsertId(upsertResult)
    return id
  }

  async updateById(id, doc) {
    const ret = await this.collection.update(
      { _id: id },
      {
        $set: Object.assign({}, doc, {
          updatedAt: Date.now()
        })
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
