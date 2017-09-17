import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class Answer {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('answer')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection.find().sort({ _id: -1 }).skip(skip).limit(limit).toArray()
  }

  exercise(answer) {
    return this.context.Exercise.findOneById(answer.exerciseId)
  }

  answerImages(answer, { skip = 0, limit = 10 }) {
    return this.context.AnswerImage.collection.find({
      answerId: answer._id
    }).sort({ _id: -1 }).skip(skip).limit(limit).toArray()
  }

  userAnswers(answer, { skip = 0, limit = 10 }) {
    return this.context.UserAnswer.collection.find({
      answerId: answer._id
    }).sort({ _id: -1 }).skip(skip).limit(limit).toArray()
  }

  async insert(doc) {
    const docToInsert = Object.assign({}, doc, {
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    const id = (await this.collection.insertOne(docToInsert)).insertedId
    return id
  }

  async updateById(id, doc) {
    const ret = await this.collection.update({ _id: id }, {
      $set: Object.assign({}, doc, {
        updatedAt: Date.now()
      })
    })
    this.loader.clear(id)
    return ret
  }

  async removeById(id) {
    const ret = this.collection.remove({ _id: id })
    this.loader.clear(id)
    return ret
  }
}
