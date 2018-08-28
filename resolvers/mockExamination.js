const resolvers = {
  MockExamination: {
    id(mockExamination) {
      return mockExamination._id
    },

    exercise(mockExamination, { skip, limit }, { MockExamination }) {
      return MockExamination.exercise(mockExamination, { skip, limit })
    }
  },
  Query: {
    mockExaminations(root, { skip, limit }, { MockExamination }) {
      return MockExamination.all({ skip, limit })
    },

    mockExamination(root, { id }, { MockExamination }) {
      return MockExamination.findOneById(id)
    }
  },
  Mutation: {
    async createMockExamination(root, { input }, { MockExamination }) {
      const id = await MockExamination.insert(input)
      return MockExamination.findOneById(id)
    },

    async updateMockExamination(root, { id, input }, { MockExamination }) {
      await MockExamination.updateById(id, input)
      return MockExamination.findOneById(id)
    },

    removeMockExamination(root, { id }, { MockExamination }) {
      return MockExamination.removeById(id)
    }
  }
}

export default resolvers
