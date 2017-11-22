import { func } from '../../../Library/Caches/typescript/2.6/node_modules/@types/assert-plus'

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
    async createUserAnswer(root, { input }, { User, UserAnswer, Answer, Exercise, RateOfProgressOfSection, RateOfProgressOfExamination }) {
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

      const id = await UserAnswer.insert(input)
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
      updateExercise(Exercise, UserAnswer, Answer, exercise, input)
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

    let all = await this.context.UserAnswer.collection.count({ exerciseId: exercise._id })
    let right = await this.context.UserAnswer.collection.count({ exerciseId: exercise._id, isAnswer: true })
    let rightRate = Math.round(right / all * 100)

    Exercise.updateById(exerciseId, { answerCount, rightCount, normalErrorAnswer, rightRate })
  } catch (e) {
    console.log(e)
  }
}

export default resolvers
