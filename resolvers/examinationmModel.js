const resolvers = {
  ExaminationmModel: {
    id(examinationmModel) {
      return examinationmModel._id
    }
  },
  Query: {
    examinationmModels(root, { skip, limit }, { ExaminationmModel }) {
      return ExaminationmModel.all({ skip, limit })
    },
    examinationmModel(root, { id }, { ExaminationmModel }) {
      return ExaminationmModel.findOneById(id)
    }
  },
  Mutation: {
    async createExaminationmModel(root, { input }, { ExaminationmModel }) {
      const id = await ExaminationmModel.insert(input)
      return ExaminationmModel.findOneById(id)
    },

    async updateExaminationmModel(root, { id, input }, { ExaminationmModel }) {
      await ExaminationmModel.updateById(id, input)
      return ExaminationmModel.findOneById(id)
    },

    removeExaminationmModel(root, { id }, { ExaminationmModel }) {
      return ExaminationmModel.removeById(id)
    }
  }
}

export default resolvers
