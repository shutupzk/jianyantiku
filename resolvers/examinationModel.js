const resolvers = {
  ExaminationModel: {
    id(examinationModel) {
      return examinationModel._id
    },

    examinationdifficulty(examinationModel, input, { ExaminationModel }) {
      return ExaminationModel.examinationdifficulty(examinationModel)
    },

    exercises(examinationModel, { skip, limit }, { ExaminationModel }) {
      return ExaminationModel.exercises(examinationModel, { skip, limit })
    }
  },
  Query: {
    examinationModels(root, { skip, limit }, { ExaminationModel }) {
      return ExaminationModel.all({ skip, limit })
    },
    examinationModel(root, { id }, { ExaminationModel }) {
      return ExaminationModel.findOneById(id)
    }
  },
  Mutation: {
    async createExaminationModel(root, { input }, { ExaminationModel }) {
      const id = await ExaminationModel.insert(input)
      return ExaminationModel.findOneById(id)
    },

    async updateExaminationModel(root, { id, input }, { ExaminationModel }) {
      await ExaminationModel.updateById(id, input)
      return ExaminationModel.findOneById(id)
    },

    removeExaminationModel(root, { id }, { ExaminationModel }) {
      return ExaminationModel.removeById(id)
    }
  }
}

export default resolvers
