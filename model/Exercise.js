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

  all({ skip = 0, limit = 10, hot }) {
    let options = {}
    if (hot) {
      options = {
        hot
      }
    }
    return this.collection.find(options).skip(skip).limit(limit).toArray()
  }

  section(exercise) {
    if (!exercise.sectionId) return null
    return this.context.Section.findOneById(exercise.sectionId)
  }

  subject(exercise) {
    if (!exercise.subjectId) return null
    return this.context.Subject.findOneById(exercise.subjectId)
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
    }).skip(skip).limit(limit).toArray()
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

  notes(exercise, { skip = 0, limit = 10, userId }) {
    let options = {}
    if (userId) {
      options = {
        exerciseId: exercise._id,
        userId
      }
    } else {
      options = {
        exerciseId: exercise._id
      }
    }
    return this.context.Note.collection.find(options).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
  }

  analysiss(exercise, { skip = 0, limit = 10 }) {
    return this.context.Analysis.collection.find({
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
