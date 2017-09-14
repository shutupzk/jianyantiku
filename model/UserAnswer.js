import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'
import moment from 'moment'

export default class UserAnswer {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('userAnswer')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  all({ skip = 0, limit = 10 }) {
    return this.collection
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  user(userAnswer) {
    return this.context.User.findOneById(userAnswer.userId)
  }

  answer(userAnswer) {
    return this.context.Answer.findOneById(userAnswer.answerId)
  }

  examinationHasExercise(userAnswer) {
    return this.context.ExaminationHasExercise.findOneById(userAnswer.examinationHasExerciseId)
  }

  async insert(doc) {
    const { Answer, UserDayAnswer, Decoration, DecorationType, UserHasDecoration, ScoreRecord } = this.context
    const docToInsert = Object.assign({}, doc, {
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    const id = (await this.collection.insertOne(docToInsert)).insertedId

    // 添加做题数
    Answer.findOneById(doc.answerId).then(async answer => {
      let date = moment().format('YYYY-MM-DD')
      let userId = doc.userId
      let correct = answer.isAnswer ? 1 : 0
      let exit = await UserDayAnswer.collection.findOne({ date, userId })
      if (exit) {
        let totalCount = exit.totalCount + 1
        let correctCount = exit.correctCount + correct
        await UserDayAnswer.updateById(exit._id, { totalCount, correctCount })
        if (totalCount === 100) {
          ScoreRecord.autoInsert({ userId, code: '3' })
        }
      } else {
        await UserDayAnswer.insert({ userId, totalCount: 1, correctCount: 1, date })
      }

      let userDayAnswers = await UserDayAnswer.collection.find({ userId }).toArray()
      let totalCount = 0
      let correctCount = 0
      for (let userDayAnswer of userDayAnswers) {
        totalCount += userDayAnswer.totalCount
        correctCount += userDayAnswer.correctCount
      }

      let totalTypeId = (await DecorationType.collection.findOne({ code: '01' }))._id
      let correctTypeId = (await DecorationType.collection.findOne({ code: '02' }))._id
      let decorations = await Decoration.collection
        .find({
          $or: [
            {
              decorationTypeId: totalTypeId,
              score: { $lte: totalCount }
            },
            {
              decorationTypeId: correctTypeId,
              score: { $lte: correctCount }
            }
          ]
        })
        .toArray()
      for (let decoration of decorations) {
        let decorationId = decoration._id
        let userHasDecoration = {
          userId,
          decorationId,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        UserHasDecoration.collection.findOneAndUpdate(
          {
            userId,
            decorationId
          },
          userHasDecoration,
          { upsert: true }
        )
      }
    })
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
