const resolvers = {
  Decoration: {
    id(decoration) {
      return decoration._id
    },

    decorationType(decoration, args, { Decoration }) {
      return Decoration.decorationType(decoration)
    }

  },
  Query: {
    decorations(root, { skip, limit }, { Decoration }) {
      return Decoration.all({ skip, limit })
    },
    decoration(root, { id }, { Decoration }) {
      return Decoration.findOneById(id)
    }
  },
  Mutation: {
    async createDecoration(root, { input }, { Decoration }) {
      const id = await Decoration.insert(input)
      return Decoration.findOneById(id)
    },

    async updateDecoration(root, { id, input }, { Decoration }) {
      await Decoration.updateById(id, input)
      return Decoration.findOneById(id)
    },

    removeDecoration(root, { id }, { Decoration }) {
      return Decoration.removeById(id)
    }
  }
}

export default resolvers
