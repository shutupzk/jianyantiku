const resolvers = {
  UserDayAnswer: {
    id(userDayAnswer) {
      return userDayAnswer._id
    },

    user(userDayAnswer, args, { UserDayAnswer }) {
      return UserDayAnswer.user(userDayAnswer)
    }
  },
  Query: {
    userDayAnswers(root, { skip, limit }, { UserDayAnswer }) {
      return UserDayAnswer.all({ skip, limit })
    },

    userDayAnswer(root, { id }, { UserDayAnswer }) {
      return UserDayAnswer.findOneById(id)
    }
  },
  Mutation: {
    async createUserDayAnswer(root, { input }, { UserDayAnswer}) {
      const id = await UserDayAnswer.insert(input)
      return UserDayAnswer.findOneById(id)
    },

    async updateUserDayAnswer(root, { id, input }, { UserDayAnswer }) {
      await UserDayAnswer.updateById(id, input)
      return UserDayAnswer.findOneById(id)
    },

    removeUserDayAnswer(root, { id }, { UserDayAnswer }) {
      return UserDayAnswer.removeById(id)
    }
  }
}

export default resolvers
