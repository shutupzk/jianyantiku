const resolvers = {
  Analysis: {
    id(analysis) {
      return analysis._id
    },

    user(analysis, args, { Analysis }) {
      return Analysis.user(analysis)
    },

    exercise(analysis, args, { Analysis }) {
      return Analysis.exercise(analysis)
    }
  },
  Query: {
    analysiss(root, { skip, limit }, { Analysis }) {
      return Analysis.all({ skip, limit })
    },

    analysis(root, { id }, { Analysis }) {
      return Analysis.findOneById(id)
    }
  },
  Mutation: {
    async createAnalysis(root, { input }, { Analysis }) {
      const id = await Analysis.insert(input)
      return Analysis.findOneById(id)
    },

    async updateAnalysis(root, { id, input }, { Analysis }) {
      await Analysis.updateById(id, input)
      return Analysis.findOneById(id)
    },

    removeAnalysis(root, { id }, { Analysis }) {
      return Analysis.removeById(id)
    }
  }
}

export default resolvers
