import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'
import moment from 'moment'

export default class Examination {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('examination')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  user(examination) {
    if (!examination.userId) return null
    return this.context.User.findOneById(examination.userId)
  }

  examinationModel(examination) {
    if (!examination.examinationModelId) return null
    return this.context.ExaminationModel.findOneById(examination.examinationModelId)
  }

  examinationType(examination) {
    if (!examination.examinationTypeId) return null
    return this.context.ExaminationType.findOneById(examination.examinationTypeId)
  }

  examinationDifficulty(examination) {
    if (!examination.examinationDifficultyId) return null
    return this.context.ExaminationDifficulty.findOneById(examination.examinationDifficultyId)
  }

  examinationHasExercises(examination, { skip = 0, limit = 10 }) {
    return this.context.ExaminationHasExercise.collection
      .find({
        examinationId: examination._id
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
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

  async insert(doc) {
    const { ExerciseId } = this.context
    let idObj = await ExerciseId.collection.findOne()
    let ids = idObj.ids || []
    const docToInsert = Object.assign({}, doc, {
      startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment()
        .add(1, 'hours')
        .format('YYYY-MM-DD HH:mm:ss'),
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    const examinationId = (await this.collection.insertOne(docToInsert)).insertedId
    let exerciseIds = []
    if (doc.examinationModelId) {
      let exerciseIds = (await this.context.ExaminationModel.findOneById(doc.examinationModelId)).exerciseIds
      await this.collection.updateOne({ _id: examinationId }, { $set: { totalCount: exerciseIds.length } })
    } else {
      let count = ids.length
      if (count <= 1) {
        await this.collection.updateOne({ _id: examinationId }, { $set: { totalCount: count } })
        exerciseIds = [...ids]
      } else {
        await this.collection.updateOne({ _id: examinationId }, { $set: { totalCount: 100 } })
        for (let i = 0; i < 100; i++) {
          let readom = Math.floor(Math.random() * 50000)
          exerciseIds.push(ids[readom])
        }
      }
    }

    await this.context.ExaminationHasExercise.collection.deleteMany({ examinationId })
    let insertArray = []
    for (let exerciseId of exerciseIds) {
      let obj = {
        exerciseId,
        examinationId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      insertArray.push(obj)
    }
    // console.log(insertArray)
    await this.context.ExaminationHasExercise.collection.insertMany(insertArray)

    return examinationId
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

function getRadmom(source, result) {
  let sourceLength = source.length
  let resultLength = result.length
  if (sourceLength === 0 || resultLength === 100) return result
  let readom = Math.floor(Math.random() * sourceLength)
  result.push(source[readom]._id)
  source.splice(readom, 1)
  return getRadmom(source, result)
}
