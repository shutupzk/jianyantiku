import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class ErrorExercise {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('errorExercise')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection.find().sort({ _id: -1 }).skip(skip).limit(limit).toArray()
  }

  user(errorExercise) {
    return this.context.User.findOneById(errorExercise.userId)
  }

  exercise(errorExercise) {
    return this.context.Exercise.findOneById(errorExercise.exerciseId)
  }

  async insert(doc) {
    const docToInsert = Object.assign({}, doc, {
      adopt: '0',
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    const id = (await this.collection.insertOne(docToInsert)).insertedId
    return id
  }

  async updateById(id, doc) {
    const { ScoreRecord } = this.context
    const { adopt } = doc
    const errorExercise = await this.findOneById(id)
    const ret = await this.collection.update({ _id: id }, {
      $set: Object.assign({}, doc, {
        updatedAt: Date.now()
      })
    })
    if (adopt === '1' && errorExercise.adopt === '0') {
      const { userId } = errorExercise
      ScoreRecord.autoInsert({ userId, code: '12' })
    }
    this.loader.clear(id)
    return ret
  }

  async removeById(id) {
    const ret = this.collection.remove({ _id: id })
    this.loader.clear(id)
    return ret
  }
}
