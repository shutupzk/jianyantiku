const resolvers = {
  YearExamType: {
    id(yearExamType) {
      return yearExamType._id
    }
  },
  Query: {
    yearExamTypes(root, { lastCreatedAt, skip, limit }, { YearExamType }) {
      return YearExamType.all({ lastCreatedAt, skip, limit })
    },

    yearExamType(root, { id }, { YearExamType }) {
      return YearExamType.findOneById(id)
    }
  },
  Mutation: {
    async createYearExamType(root, { input }, { YearExamType }) {
      const id = await YearExamType.insert(input)
      return YearExamType.findOneById(id)
    },

    async updateYearExamType(root, { id, input }, { YearExamType }) {
      await YearExamType.updateById(id, input)
      return YearExamType.findOneById(id)
    },

    removeYearExamType(root, { id }, { YearExamType }) {
      return YearExamType.removeById(id)
    }
  }
}

export default resolvers
