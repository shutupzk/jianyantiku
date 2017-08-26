import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class ScoreRecord {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('scoreRecord')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection.find().sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
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

  user(scoreRecord) {
    return this.context.User.findOneById(scoreRecord.userId)
  }

  scoreType(scoreRecord) {
    return this.context.ScoreType.findOneById(scoreRecord.scoreTypeId)
  }

}
