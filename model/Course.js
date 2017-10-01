import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class Course {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('course')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10, hot }) {
    let ops = {}
    if (hot) ops.hot = hot
    return this.collection.find(ops).sort({ _id: -1 }).skip(skip).limit(limit).toArray()
  }

  subject(course) {
    if (!course.subjectId) return null
    return this.context.Subject.findOneById(course.subjectId)
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
