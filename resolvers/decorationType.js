const resolvers = {
  DecorationType: {
    id(decorationType) {
      return decorationType._id
    },

    decorations(decorationType, { skip, limit }, { DecorationType }) {
      return DecorationType.decorations(decorationType, { skip, limit })
    }

  },
  Query: {
    decorationTypes(root, { skip, limit }, { DecorationType }) {
      return DecorationType.all({ skip, limit })
    },
    decorationType(root, { id }, { DecorationType }) {
      return DecorationType.findOneById(id)
    }
  },
  Mutation: {
    async createDecorationType(root, { input }, { DecorationType }) {
      const id = await DecorationType.insert(input)
      return DecorationType.findOneById(id)
    },

    async updateDecorationType(root, { id, input }, { DecorationType }) {
      await DecorationType.updateById(id, input)
      return DecorationType.findOneById(id)
    },

    removeDecorationType(root, { id }, { DecorationType }) {
      return DecorationType.removeById(id)
    }
  }
}

export default resolvers
