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
    async createUserAnswer(root, { input }, { User, UserAnswer, Answer, Exercise, RateOfProgressOfSection }) {
      const { userId } = input
      const answer = await Answer.findOneById(input.answerId)
      const { exerciseId } = answer
      const exercise = await Exercise.findOneById(exerciseId)
      const { type } = exercise
      const user = await User.findOneById(userId)
      let { score, scoreUsed } = user
      if (type === '01') {
        const answers = await Answer.collection.find({ exerciseId }).toArray()
        let answerIds = []
        for (let doc of answers) {
          answerIds.push(doc._id)
        }
        const count = await UserAnswer.collection.count({ answerId: { $in: answerIds } })
        if (count === 0) {
          if (scoreUsed > score || score === scoreUsed) {
            throw new Error('您的积分不足')
          }
          scoreUsed += 0.1
        }
      }
      const id = await UserAnswer.insert(input)
      // User.updateById(userId, { scoreUsed })
      const { sectionId, num, examinationDifficultyId } = exercise
      const rateOfProgressOfSection = await RateOfProgressOfSection.collection.findOne({ userId, sectionId, examinationDifficultyId })
      let current = num
      if (rateOfProgressOfSection) {
        if (num > rateOfProgressOfSection.current) {
          await RateOfProgressOfSection.updateById(rateOfProgressOfSection._id, { current })
        }
      } else {
        await RateOfProgressOfSection.insert({ userId, sectionId, current, examinationDifficultyId })
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
