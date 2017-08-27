const resolvers = {
  ExaminationType: {
    id(examinationType) {
      return examinationType._id
    }
  },
  Query: {
    examinationTypes(root, { skip, limit }, { ExaminationType }) {
      return ExaminationType.all({ skip, limit })
    },
    examinationType(root, { id }, { ExaminationType }) {
      return ExaminationType.findOneById(id)
    }
  },
  Mutation: {
    async createExaminationType(root, { input }, { ExaminationType }) {
      const id = await ExaminationType.insert(input)
      return ExaminationType.findOneById(id)
    },

    async updateExaminationType(root, { id, input }, { ExaminationType }) {
      await ExaminationType.updateById(id, input)
      return ExaminationType.findOneById(id)
    },

    removeExaminationType(root, { id }, { ExaminationType }) {
      return ExaminationType.removeById(id)
    }
  }
}

export default resolvers
