const resolvers = {
  AnswerImage: {
    id(answerImage) {
      return answerImage._id
    },

    answer(answerImage, args, { AnswerImage }) {
      return AnswerImage.answer(answerImage)
    }
  },
  Query: {
    answerImages(root, { skip, limit }, { AnswerImage }) {
      return AnswerImage.all({ skip, limit })
    },

    answerImage(root, { id }, { AnswerImage }) {
      return AnswerImage.findOneById(id)
    }
  },
  Mutation: {
    async createAnswerImage(root, { input }, { AnswerImage }) {
      const id = await AnswerImage.insert(input)
      return AnswerImage.findOneById(id)
    },

    async updateAnswerImage(root, { id, input }, { AnswerImage }) {
      await AnswerImage.updateById(id, input)
      return AnswerImage.findOneById(id)
    },

    removeAnswerImage(root, { id }, { AnswerImage }) {
      return AnswerImage.removeById(id)
    }
  }
}

export default resolvers
