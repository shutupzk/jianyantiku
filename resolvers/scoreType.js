const resolvers = {
  ScoreType: {
    id(scoreType) {
      return scoreType._id
    },

    scoreRecords(scoreType, { skip, limit }, { ScoreType }) {
      return ScoreType.scoreRecords(scoreType, { skip, limit })
    }

  },
  Query: {
    scoreTypes(root, { skip, limit }, { ScoreType }) {
      return ScoreType.all({ skip, limit })
    },
    scoreType(root, { id }, { ScoreType }) {
      return ScoreType.findOneById(id)
    }
  },
  Mutation: {
    async createScoreType(root, { input }, { ScoreType }) {
      const id = await ScoreType.insert(input)
      return ScoreType.findOneById(id)
    },

    async updateScoreType(root, { id, input }, { ScoreType }) {
      await ScoreType.updateById(id, input)
      return ScoreType.findOneById(id)
    },

    removeScoreType(root, { id }, { ScoreType }) {
      return ScoreType.removeById(id)
    }
  }
}

export default resolvers
