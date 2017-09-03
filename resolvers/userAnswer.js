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
    async createUserAnswer(root, { input }, { UserAnswer, Answer, Exercise, RateOfProgressOfSection }) {
      const { userId } = input
      const id = await UserAnswer.insert(input)
      const answer = await Answer.findOneById(input.answerId)
      const exercise = await Exercise.findOneById(answer.exerciseId)
      const { sectionId } = exercise
      const rateOfProgressOfSection = await RateOfProgressOfSection.collection.findOne({ userId, sectionId })
      let current = 1
      if (rateOfProgressOfSection) {
        current = rateOfProgressOfSection.current + 1
        await RateOfProgressOfSection.updateById(rateOfProgressOfSection._id, { current })
      } else {
        await RateOfProgressOfSection.insert({ userId, sectionId, current })
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
