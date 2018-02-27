const resolvers = {
  Answer: {
    id(answer) {
      return answer._id
    },

    exercise(answer, args, { Answer }) {
      return Answer.exercise(answer)
    },

    async answerCount(answer, args, { Answer, UserAnswer }) {
      if (answer.answerCount) return answer.answerCount
      let answerCount = await UserAnswer.collection.count({ answerId: answer._id })
      await Answer.updateById(answer._id, { answerCount })
      return answerCount
    },

    answerImages(answer, { skip, limit }, { Answer }) {
      return Answer.answerImages(answer, { skip, limit })
    },

    userAnswers(answer, { skip, limit }, { Answer }) {
      return Answer.userAnswers(answer, { skip, limit })
    }
  },
  Query: {
    answers(root, { skip, limit }, { Answer }) {
      return Answer.all({ skip, limit })
    },

    answer(root, { id }, { Answer }) {
      return Answer.findOneById(id)
    }
  },
  Mutation: {
    async createAnswer(root, { input }, { Answer }) {
      const id = await Answer.insert(input)
      return Answer.findOneById(id)
    },

    async updateAnswer(root, { id, input }, { Answer }) {
      await Answer.updateById(id, input)
      return Answer.findOneById(id)
    },

    removeAnswer(root, { id }, { Answer }) {
      return Answer.removeById(id)
    }
  }
}

export default resolvers
