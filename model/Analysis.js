import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class Analysis {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('analysis')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection.find().sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
  }

  user(analysis) {
    if (!analysis.userId) return null
    return this.context.User.findOneById(analysis.userId)
  }

  exercise(analysis) {
    return this.context.Exercise.findOneById(analysis.exerciseId)
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
    const analysis = await this.findOneById(id)
    const ret = await this.collection.update({ _id: id }, {
      $set: Object.assign({}, doc, {
        updatedAt: Date.now()
      })
    })
    this.loader.clear(id)
    if (adopt === '1' && analysis.adopt === '0') {
      const { userId } = analysis
      ScoreRecord.autoInsert({ userId, code: '11' })
    }
    return ret
  }

  async removeById(id) {
    const ret = this.collection.remove({ _id: id })
    this.loader.clear(id)
    return ret
  }
}
