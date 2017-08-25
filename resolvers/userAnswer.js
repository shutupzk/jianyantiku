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
    async createUserAnswer(root, { input }, { UserAnswer, Patient }) {
      const id = await UserAnswer.insert(input)
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
