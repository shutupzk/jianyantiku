import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'
import { getInsertId } from '../utils'
import moment from 'moment'

export default class UserExerciseTime {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('userExerciseTime')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  user(userExerciseTime) {
    return this.context.User.findOneById(userExerciseTime.userId)
  }

  async insert(doc) {
    const { userId, times } = doc
    const docToInsert = Object.assign({}, doc, {
      date: moment().format('YYYY-MM-DD'),
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    let upsertResult = await this.collection.findOneAndUpdate({ userId, times }, docToInsert, { upsert: true })
    return getInsertId(upsertResult)
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
