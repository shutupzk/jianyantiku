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
      return UserAnswer.findOneById(id)
    },

    async updateUserAnswer(root, { id, input }, { UserAnswer }) {
      await UserAnswer.updateById(id, input)
      return UserAnswer.findOneById(id)
    },

    removeUserAnswer(root, { id }, { UserAnswer }) {
      return UserAnswer.removeById(id)
    }
  }
}

export default resolvers
