const resolvers = {
  ExaminationDifficulty: {
    id(examinationDifficulty) {
      return examinationDifficulty._id
    },

    examinationModels(examinationDifficulty, { skip, limit }, { ExaminationDifficulty }) {
      return ExaminationDifficulty.examinationModels(examinationDifficulty, { skip, limit })
    },

    subjectWithDiffcultys(examinationDifficulty, { skip, limit }, { ExaminationDifficulty }) {
      return ExaminationDifficulty.subjectWithDiffcultys(examinationDifficulty, { skip, limit })
    },

    yearExerciseTypes(examinationDifficulty, { skip, limit }, { ExaminationDifficulty }) {
      return ExaminationDifficulty.yearExerciseTypes(examinationDifficulty, { skip, limit })
    }
  },
  Query: {
    examinationDifficultys(root, { skip, limit }, { ExaminationDifficulty }) {
      return ExaminationDifficulty.all({ skip, limit })
    },
    examinationDifficulty(root, { id }, { ExaminationDifficulty }) {
      return ExaminationDifficulty.findOneById(id)
    }
  },
  Mutation: {
    async createExaminationDifficulty(root, { input }, { ExaminationDifficulty }) {
      const id = await ExaminationDifficulty.insert(input)
      return ExaminationDifficulty.findOneById(id)
    },

    async updateExaminationDifficulty(root, { id, input }, { ExaminationDifficulty }) {
      await ExaminationDifficulty.updateById(id, input)
      return ExaminationDifficulty.findOneById(id)
    },

    removeExaminationDifficulty(root, { id }, { ExaminationDifficulty }) {
      return ExaminationDifficulty.removeById(id)
    }
  }
}

export default resolvers
