import moment from 'moment'
const resolvers = {
  UserAnswer: {
    id(userAnswer) {
      return userAnswer._id
    },

    user(userAnswer, args, { UserAnswer }) {
      return UserAnswer.user(userAnswer)
    },

    answer(userAnswer, args, { UserAnswer }) {
      return UserAnswer.answer(userAnswer)
    },

    examinationHasExercise(userAnswer, args, { UserAnswer }) {
      return UserAnswer.examinationHasExercise(userAnswer)
    },

    exercise(userAnswer, args, { UserAnswer }) {
      return UserAnswer.exercise(userAnswer)
    }
  },
  Query: {
    userAnswers(root, { skip, limit }, { UserAnswer }) {
      return UserAnswer.all({ skip, limit })
    },

    userAnswer(root, { id }, { UserAnswer }) {
      return UserAnswer.findOneById(id)
    }
  },
  Mutation: {
    async createUserAnswer(
      root,
      { input },
      { User, UserAnswer, Answer, Exercise, RateOfProgressOfSection, RateOfProgressOfExamination, UserDayAnswer, ScoreRecord, DecorationType, Decoration, UserHasDecoration }
    ) {
      const { userId, answerId } = input
      const answer = await Answer.findOneById(answerId)
      let { exerciseId } = answer
      const exercise = await Exercise.findOneById(exerciseId)
      const { type } = exercise
      const user = await User.findOneById(userId)
      let { score, scoreUsed, memberId } = user
      if (!memberId) {
        if (type === '01') {
          if (scoreUsed > score || score === scoreUsed) {
            throw new Error('您的积分不足')
          }
          scoreUsed = scoreUsed || 0
          scoreUsed += 0.1
          scoreUsed = Math.round(scoreUsed * 100) / 100
        }
      }
      input.exerciseId = exerciseId
      const id = await UserAnswer.insert(input)
      updateUserExercise({ input, userId, user, exercise, scoreUsed }, { UserAnswer, User, RateOfProgressOfSection, RateOfProgressOfExamination })
      addAnserCount(input, answer, user, { User, Answer, UserDayAnswer, ScoreRecord, DecorationType, Decoration, UserHasDecoration })
      updateExercise({Exercise, UserAnswer, Answer, exercise, input, answer})
      return UserAnswer.findOneById(id)
    },

    async createErrorUserAnswer(root, { input }, { UserAnswer, Answer, Exercise }) {
      const { userId, isAnswer, answerId } = input
      const answer = await Answer.findOneById(answerId)
      const { exerciseId } = answer
      if (isAnswer) {
        await UserAnswer.collection.updateMany({ userId, exerciseId }, { $set: { deleted: true } })
        return true
      }
      return false
    },

    async createRErrorUserAnswer(root, { input }, { UserAnswer, Answer, Exercise }) {
      const { userId, isAnswer, answerId } = input
      const answer = await Answer.findOneById(answerId)
      const { exerciseId } = answer
      if (isAnswer) {
        await UserAnswer.collection.updateMany({ userId, exerciseId }, { $set: { deleted: true } })
      }
      return Exercise.findOneById(exerciseId)
    },

    async updateUserAnswer(root, { id, input }, { UserAnswer }) {
      await UserAnswer.updateById(id, input)
      return UserAnswer.findOneById(id)
    },

    removeUserAnswer(root, { id }, { UserAnswer, exercise }) {
      return UserAnswer.removeById(id)
    }
  }
}

async function updateUserExercise({ input, userId, user, exercise, scoreUsed }, { UserAnswer, User, RateOfProgressOfSection, RateOfProgressOfExamination }) {
  const { type } = exercise
  let correct = input.isAnswer ? 1 : 0
  User.updateById(userId, { scoreUsed, countUserAnswer: (user.countUserAnswer || 0) + 1, countRightUserAnswer: (user.countRightUserAnswer || 0) + correct })
  const { sectionId, num, examinationDifficultyId, yearHasTypeId } = exercise
  if (type === '01' || type === '03') {
    const rateOfProgressOfSection = await RateOfProgressOfSection.collection.findOne({ userId, sectionId, examinationDifficultyId, type })
    let current = num
    if (rateOfProgressOfSection) {
      if (num > rateOfProgressOfSection.current) {
        await RateOfProgressOfSection.updateById(rateOfProgressOfSection._id, { current })
      }
    } else {
      await RateOfProgressOfSection.insert({ userId, sectionId, current, examinationDifficultyId, type })
    }
  } else if (type === '02') {
    const rateOfProgressOfExamination = await RateOfProgressOfExamination.collection.findOne({ userId, yearHasTypeId, examinationDifficultyId, type })
    let current = num
    if (rateOfProgressOfExamination) {
      await RateOfProgressOfExamination.updateById(rateOfProgressOfExamination._id, { current })
    } else {
      await RateOfProgressOfExamination.insert({ userId, yearHasTypeId, current, examinationDifficultyId, type })
    }
  }
}

async function addAnserCount(doc, answer, user, { User, Answer, UserDayAnswer, ScoreRecord, DecorationType, Decoration, UserHasDecoration }) {
  // 添加做题数
  let date = moment().format('YYYY-MM-DD')
  let userId = doc.userId
  let correct = answer.isAnswer ? 1 : 0
  let exit = await UserDayAnswer.collection.findOne({ date, userId })
  if (exit) {
    let totalCount = exit.totalCount + 1
    let correctCount = exit.correctCount + correct
    UserDayAnswer.updateById(exit._id, { totalCount, correctCount })
    if (totalCount === 100) {
      ScoreRecord.autoInsert({ userId, code: '3' })
    }
  } else {
    UserDayAnswer.insert({ userId, totalCount: 1, correctCount: 1, date })
  }
}

async function updateExercise({Exercise, UserAnswer, Answer, exercise, input, answer}) {
  try {
    let { answerCount, rightCount } = exercise
    const { isAnswer } = input
    if (!answerCount) answerCount = 0
    answerCount++
    if (!rightCount) rightCount = 0
    if (isAnswer) rightCount++
    const exerciseId = exercise._id
    let aCount = answer.answerCount || 0
    await Answer.updateById(answer._id, { answerCount: aCount + 1 })
    const answers = await Answer.collection.find({ exerciseId }).toArray()
    let index = 0
    let keyArray = ['A', 'B', 'C', 'D', 'E']
    let normalErrorAnswer = ''
    let lastCount = 0
    for (let { _id, isAnswer, answerCount } of answers) {
      let count = 0
      if (!isAnswer) {
        if (answerCount) {
          count = answerCount
        } else {
          console.log('count ======== ')
          count = await UserAnswer.collection.count({ answerId: _id })
        }
        if (count > lastCount) {
          normalErrorAnswer = keyArray[index]
          lastCount = count
        }
      }
      index++
    }
    let rightRate = Math.round(rightCount / answerCount * 100)
    Exercise.updateById(exerciseId, { answerCount, rightCount, normalErrorAnswer, rightRate })
  } catch (e) {
    console.log(e)
  }
}

export default resolvers
