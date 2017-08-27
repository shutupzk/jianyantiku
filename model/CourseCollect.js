import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class CourseCollect {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('courseCollect')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection.find().sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
  }

  user(courseCollect) {
    return this.context.User.findOneById(courseCollect.userId)
  }

  course(courseCollect) {
    return this.context.Course.findOneById(courseCollect.courseId)
  }

  async insert(doc) {
    const docToInsert = Object.assign({}, doc, {
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    const {userId, courseId} = doc
    let has = await this.collection.findOne({userId, courseId})
    if (has) throw new Error('请勿重复收藏')
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
