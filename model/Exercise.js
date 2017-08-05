import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class Exercise {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('exercise')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection.find().sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
  }

  officialExamination(exercise) {
    if (!exercise.officialExaminationId) return null
    return this.context.OfficialExamination.findOneById(exercise.officialExaminationId)
  }

  mockExamination(exercise) {
    if (!exercise.mockExaminationId) return null
    return this.context.MockExamination.findOneById(exercise.mockExaminationId)
  }

  answers(exercise, { skip = 0, limit = 10 }) {
    return this.context.Answer.collection.find({
      exerciseId: exercise._id
    }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
  }

  exerciseCollects(exercise, { skip = 0, limit = 10 }) {
    return this.context.ExerciseCollect.collection.find({
      exerciseId: exercise._id
    }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
  }

  exerciseImages(exercise, { skip = 0, limit = 10 }) {
    return this.context.ExerciseImage.collection.find({
      exerciseId: exercise._id
    }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
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
