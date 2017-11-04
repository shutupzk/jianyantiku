import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class YearHasType {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('yearHasType')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  yearExamType(yearHasType) {
    return this.context.YearExamType.findOneById(yearHasType.yearExamTypeId)
  }

  yearExerciseList(yearHasType) {
    return this.context.YearExerciseList.findOneById(yearHasType.yearExerciseListId)
  }

  rateOfProgressOfExamination(yearHasType, { userId }) {
    return this.context.RateOfProgressOfExamination.collection.findOne({ yearHasTypeId: yearHasType._id, userId })
  }

  count(yearHasType) {
    return this.context.Exercise.collection.count({ yearHasTypeId: yearHasType._id })
  }

  exercises(yearHasType, { skip = 0, limit = 10 }) {
    return this.context.Exercise.collection
      .find({
        yearHasTypeId: yearHasType._id
      })
      .sort({num: 1})
      .skip(skip)
      .limit(limit)
      .toArray()
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
