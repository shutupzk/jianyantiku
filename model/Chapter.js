import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class Chapter {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('chapter')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  async all({ skip = 0, limit = 10, examinationDifficultyId }) {
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
      return this.collection.find({ _id: { $in: ids } }).toArray()
    }
    return this.collection.find().skip(skip).limit(limit).toArray()
  }

  subject(chapter) {
    return this.context.Subject.findOneById(chapter.subjectId)
  }

  async sections(chapter, { skip = 0, limit = 10, examinationDifficultyId }) {
    let ops = {subjectId: chapter._id}
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
      ops._id = {$in: ids}
    }
    return this.context.Section.collection.find(ops).sort({ num: 1 }).toArray()
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
