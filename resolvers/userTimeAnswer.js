const resolvers = {
  UserTimeAnswer: {
    id(userTimeAnswer) {
      return userTimeAnswer._id
    },

    user(userTimeAnswer, args, { UserTimeAnswer }) {
      return UserTimeAnswer.user(userTimeAnswer)
    },

    answer(userTimeAnswer, args, { UserTimeAnswer }) {
      return UserTimeAnswer.answer(userTimeAnswer)
    },

    exercise(userTimeAnswer, args, { UserTimeAnswer }) {
      return UserTimeAnswer.exercise(userTimeAnswer)
    },

    userExerciseTime(userTimeAnswer, args, { UserTimeAnswer }) {
      return UserTimeAnswer.userExerciseTime(userTimeAnswer)
    }
  },
  Query: {
    userTimeAnswers(root, { skip, limit }, { UserTimeAnswer }) {
      return UserTimeAnswer.all({ skip, limit })
    },

    userTimeAnswer(root, { id }, { UserTimeAnswer }) {
      return UserTimeAnswer.findOneById(id)
    }
  },
  Mutation: {
    async createUserTimeAnswer(root, { input }, { User, UserTimeAnswer, Answer }) {
      const answer = await Answer.findOneById(input.answerId)
      const { exerciseId, isAnswer } = answer
      const id = await UserTimeAnswer.insert(Object.assign({}, input, { exerciseId, isAnswer }))
      return UserTimeAnswer.findOneById(id)
    },

    async updateUserTimeAnswer(root, { id, input }, { UserTimeAnswer }) {
      await UserTimeAnswer.updateById(id, input)
      return UserTimeAnswer.findOneById(id)
    },

    removeUserTimeAnswer(root, { id }, { UserTimeAnswer }) {
      return UserTimeAnswer.removeById(id)
    }
  }
}

export default resolvers
