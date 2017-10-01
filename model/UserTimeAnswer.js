import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'
import { getInsertId } from '../utils'

export default class UserTimeAnswer {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('userTimeAnswer')
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

  user(userTimeAnswer) {
    return this.context.User.findOneById(userTimeAnswer.userId)
  }

  answer(userTimeAnswer) {
    return this.context.Answer.findOneById(userTimeAnswer.answerId)
  }

  userExerciseTime(userTimeAnswer) {
    return this.context.UserExerciseTime.findOneById(userTimeAnswer.userExerciseTimeId)
  }

  exercise(userTimeAnswer) {
    return this.context.Exercise.findOneById(userTimeAnswer.exerciseId)
  }

  async insert(doc) {
    const docToInsert = Object.assign({}, doc, {
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    const { exerciseId, userExerciseTimeId, userId } = doc
    let upsertResult = await this.collection.findOneAndUpdate({ exerciseId, userExerciseTimeId, userId }, docToInsert, { upsert: true })
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
