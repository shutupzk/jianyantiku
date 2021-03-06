import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class Exercise {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('exercise')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }

  findOneById(id) {
    return this.loader.load(id)
  }

  async all({ skip = 0, limit = 10, hot, type, examinationDifficultyId, yearExerciseListId, subjectId, sectionId, chapterId, yearExamTypeId, keyword }) {
    let options = {}
    if (hot) options.hot = hot
    if (type) options.type = type
    if (examinationDifficultyId) options.examinationDifficultyId = examinationDifficultyId
    if (yearExerciseListId) options.yearExerciseListId = yearExerciseListId
    if (subjectId) options.subjectId = subjectId
    if (chapterId) {
      let sectionIds = []
      let sections = await this.context.Section.collection.find({ chapterId }).toArray()
      for (let section of sections) {
        sectionIds.push(section._id)
      }
      options.sectionId = { $in: sectionIds }
    }
    if (sectionId) options.sectionId = sectionId
    if (yearExamTypeId) options.yearExamTypeId = yearExamTypeId
    if (keyword) {
      options['$or'] = [{ content: { $regex: keyword, $options: 'i' } }]
    }
    return this.collection
      .find(options)
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  section(exercise) {
    if (!exercise.sectionId) return null
    return this.context.Section.findOneById(exercise.sectionId)
  }

  subject(exercise) {
    if (!exercise.subjectId) return null
    return this.context.Subject.findOneById(exercise.subjectId)
  }

  yearExerciseList(exercise) {
    if (!exercise.yearExerciseListId) return null
    return this.context.YearExerciseList.findOneById(exercise.yearExerciseListId)
  }

  yearHasType(exercise) {
    if (!exercise.yearHasTypeId) return null
    return this.context.YearHasType.findOneById(exercise.yearHasTypeId)
  }

  yearExamType(exercise) {
    if (!exercise.yearExamTypeId) return null
    return this.context.YearExamType.findOneById(exercise.yearExamTypeId)
  }

  mockExamination(exercise) {
    if (!exercise.mockExaminationId) return null
    return this.context.MockExamination.findOneById(exercise.mockExaminationId)
  }

  examinationDifficulty(exercise) {
    if (!exercise.examinationDifficultyId) return null
    return this.context.ExaminationDifficulty.findOneById(exercise.examinationDifficultyId)
  }

  answerCount(exercise) {
    return this.context.UserAnswer.collection.count({ exerciseId: exercise._id })
  }

  rightCount(exercise) {
    return this.context.UserAnswer.collection.count({ exerciseId: exercise._id, isAnswer: true })
  }

  async normalErrorAnswer(exercise) {
    const { UserAnswer } = this.context
    const exerciseId = exercise._id
    const answers = await this.context.Answer.collection.find({ exerciseId }).toArray()
    let index = 0
    let keyArray = ['A', 'B', 'C', 'D', 'E']
    let returnKey = ''
    let lastCount = 0
    for (let { _id, isAnswer } of answers) {
      let count = 0
      if (!isAnswer) count = await UserAnswer.collection.count({ answerId: _id })
      if (count > lastCount) {
        returnKey = keyArray[index]
        lastCount = count
      }
      index++
    }
    return returnKey
  }

  async rightRate(exercise) {
    let all = await this.context.UserAnswer.collection.count({ exerciseId: exercise._id })
    let right = await this.context.UserAnswer.collection.count({ exerciseId: exercise._id, isAnswer: true })
    return Math.round(right / all * 100)
  }

  answers(exercise, { skip = 0, limit = 10 }) {
    return this.context.Answer.collection
      .find({
        exerciseId: exercise._id
      })
      .toArray()
  }

  exerciseCollects(exercise, { skip = 0, limit = 10 }) {
    return this.context.ExerciseCollect.collection
      .find({
        exerciseId: exercise._id
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  exerciseImages(exercise, { skip = 0, limit = 10 }) {
    return this.context.ExerciseImage.collection
      .find({
        exerciseId: exercise._id
      })
      .toArray()
  }

  notes(exercise, { skip = 0, limit = 10, userId }) {
    let options = {}
    if (userId) {
      options = {
        exerciseId: exercise._id,
        userId
      }
    } else {
      options = {
        exerciseId: exercise._id
      }
    }
    return this.context.Note.collection.find(options).toArray()
  }

  analysiss(exercise, { skip = 0, limit = 10 }) {
    let ops = { exerciseId: exercise._id, $or: [{ adopt: { $exists: false } }, { adopt: '1' }, { adopt: null }] }
    return this.context.Analysis.collection.find(ops).toArray()
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
