import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'
import moment from 'moment'
import { getInsertId } from '../utils'

export default class UserShare {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('userShare')
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

  user(userShare) {
    return this.context.User.findOneById(userShare.userId)
  }

  async insert(doc) {
    const { ScoreRecord } = this.context
    const { userId, type } = doc
    let date = moment().format('YYYY-MM-DD')
    const docToInsert = Object.assign({}, doc, {
      date,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    let lastShare = await this.collection.find({ userId, date, type })
    if (!lastShare) {
      ScoreRecord.autoInsert({ userId, code: '4' })
    }
    const id = (await this.collection.insertOne(docToInsert)).insertedId
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
