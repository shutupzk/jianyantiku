import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class Subject {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('subject')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  async all({ skip = 0, limit = 10, examinationDifficultyId }) {
    if (examinationDifficultyId) {
      const deffuculties = await this.context.SubjectWithDiffculty.collection
        .find({
          examinationDifficultyId
        })
        .toArray()
      let subjectIds = []
      for (let deffuculty of deffuculties) {
        subjectIds.push(deffuculty.subjectId)
      }
      return this.collection.find({ _id: { $in: subjectIds } }).toArray()
    }
    return this.collection.find().toArray()
  }

  async chapters(subject, { skip = 0, limit = 10, examinationDifficultyId }) {
    let ops = { subjectId: subject._id }
    if (examinationDifficultyId) {
      const deffuculties = await this.context.ChapterWithDiffculty.collection
        .find({
          examinationDifficultyId
        })
        .toArray()
      let ids = []
      for (let deffuculty of deffuculties) {
        ids.push(deffuculty.chapterId)
      }
      ops._id = { $in: ids }
    }
    return this.context.Chapter.collection
      .find(ops)
      .sort({ num: 1 })
      .toArray()
  }

  subjectWithDiffcultys(subject, { skip = 0, limit = 10 }) {
    return this.context.SubjectWithDiffculty.collection
      .find({
        subjectId: subject._id
      })
      .toArray()
  }

  exercises(subject, { skip = 0, limit = 10, hot }) {
    let options = { subjectId: subject._id }
    if (hot) {
      options.hot = hot
    }
    return this.context.Exercise.collection
      .find(options)
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  hotCount(subject) {
    let options = { subjectId: subject._id, hot: true }
    return this.context.Exercise.collection.count(options)
  }

  async errorCount(subject, { userId }) {
    let options = { subjectId: subject._id, userId, isAnswer: false }
    const userAnswers = await this.context.UserAnswer.collection.find(options).toArray()
    let ids = []
    for (let obj of userAnswers) {
      ids.push(obj.exerciseId)
    }
    return this.context.Exercise.collection.count({ _id: { $in: ids } })
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
