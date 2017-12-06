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
    async createUserAnswer(root, { input }, { User, UserAnswer, Answer, Exercise, RateOfProgressOfSection, RateOfProgressOfExamination, UserDayAnswer, ScoreRecord, DecorationType, Decoration, UserHasDecoration }) {
      console.log(Date.now())
      const { userId } = input
      const answer = await Answer.findOneById(input.answerId)
      const { exerciseId } = answer
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
      updateExercise(Exercise, UserAnswer, Answer, exercise, input)
      addAnserCount(input, user, { User, Answer, UserDayAnswer, ScoreRecord, DecorationType, Decoration, UserHasDecoration })
      console.log('4')
      console.log(Date.now())
      return UserAnswer.findOneById(id)
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

async function updateUserExercise({ input, userId, exercise, scoreUsed }, { UserAnswer, User, RateOfProgressOfSection, RateOfProgressOfExamination }) {
  const { type } = exercise
  User.updateById(userId, { scoreUsed })
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
      // if (num > rateOfProgressOfExamination.current) {
      await RateOfProgressOfExamination.updateById(rateOfProgressOfExamination._id, { current })
    } else {
      await RateOfProgressOfExamination.insert({ userId, yearHasTypeId, current, examinationDifficultyId, type })
    }
  }
  console.log('1')
}

async function addAnserCount(doc, user, { User, Answer, UserDayAnswer, ScoreRecord, DecorationType, Decoration, UserHasDecoration }) {
  // 添加做题数
  Answer.findOneById(doc.answerId).then(async answer => {
    let date = moment().format('YYYY-MM-DD')
    let userId = doc.userId
    let correct = answer.isAnswer ? 1 : 0
    User.updateById(userId, { countUserAnswer: (user.countUserAnswer || 0) + 1, countRightUserAnswer: (user.countRightUserAnswer || 0) + correct })
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
  console.log('3')
}

async function updateExercise(Exercise, UserAnswer, Answer, exercise, input) {
  try {
    let { answerCount, rightCount } = exercise
    const { isAnswer } = input
    if (!answerCount) {
      answerCount = await UserAnswer.collection.count({ exerciseId: exercise._id })
    }
    answerCount++

    if (!rightCount) {
      rightCount = await UserAnswer.collection.count({ exerciseId: exercise._id, isAnswer: true })
    }
    if (isAnswer) rightCount++

    const exerciseId = exercise._id
    const answers = await Answer.collection.find({ exerciseId }).toArray()
    const userAnswers = await UserAnswer.collection.find({ exerciseId, isAnswer: false }).toArray()
    let keys = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0
    }
    let keyArray = ['A', 'B', 'C', 'D', 'E']
    let anserkeys = {}
    for (let i = 0; i < answers.length; i++) {
      let answer = answers[i]
      anserkeys[answer._id] = keyArray[i]
    }
    for (let answer of userAnswers) {
      keys[anserkeys[answer.answerId]]++
    }
    let normalErrorAnswer = ''
    let length = 0
    for (let key in keys) {
      if (keys[key] > length) {
        length = keys[key]
        normalErrorAnswer = key
      }
    }

    let all = await UserAnswer.collection.count({ exerciseId: exercise._id })
    let right = await UserAnswer.collection.count({ exerciseId: exercise._id, isAnswer: true })
    let rightRate = Math.round(right / all * 100)

    Exercise.updateById(exerciseId, { answerCount, rightCount, normalErrorAnswer, rightRate })
  } catch (e) {
    console.log(e)
  }
  console.log('2')
}

export default resolvers
