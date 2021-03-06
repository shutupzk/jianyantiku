import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class Section {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('section')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  async all({ skip = 0, limit = 10, examinationDifficultyId }) {
    if (examinationDifficultyId) {
      const deffuculties = await this.context.SectionWithDiffculty.collection
        .find({
          examinationDifficultyId
        })
        .toArray()
      let ids = []
      for (let deffuculty of deffuculties) {
        ids.push(deffuculty.sectionId)
      }
      return this.collection.find({ _id: { $in: ids } }).toArray()
    }
    return this.collection.find().sort({ _id: -1 }).skip(skip).limit(limit).toArray()
  }

  count(section, { examinationDifficultyId, type = '01' }) {
    let ops = { sectionId: section._id, type }
    if (examinationDifficultyId) ops.examinationDifficultyId = examinationDifficultyId
    return this.context.Exercise.collection.count(ops)
  }

  chapter(section) {
    return this.context.Chapter.findOneById(section.chapterId)
  }

  exercises(section, { skip = 0, limit = 10, examinationDifficultyId, type = '01' }) {
    if (limit < 10) limit = 10
    let ops = { sectionId: section._id, type }
    if (examinationDifficultyId) ops.examinationDifficultyId = examinationDifficultyId
    return this.context.Exercise.collection.find(ops).skip(skip).limit(limit).sort({num: 1}).toArray()
  }

  rateOfProgressOfSection(section, { skip = 0, limit = 10, userId, examinationDifficultyId, type = '01' }) {
    let ops = { sectionId: section._id, userId, type }
    if (examinationDifficultyId) ops.examinationDifficultyId = examinationDifficultyId
    return this.context.RateOfProgressOfSection.collection.findOne(ops)
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
