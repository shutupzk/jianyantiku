const resolvers = {
  Examination: {
    id(examination) {
      return examination._id
    },

    user(examination, input, { Examination }) {
      return Examination.user(examination)
    },

    subject(examination, input, { Examination }) {
      return Examination.subject(examination)
    },

    examinationDifficulty(examination, input, { Examination }) {
      return Examination.examinationDifficulty(examination)
    },

    examinationType(examination, input, { Examination }) {
      return Examination.examinationType(examination)
    }
  },
  Query: {
    examinations(root, { skip, limit }, { Examination }) {
      return Examination.all({ skip, limit })
    },
    examination(root, { id }, { Examination }) {
      return Examination.findOneById(id)
    }
  },
  Mutation: {
    async createExamination(root, { input }, { Examination }) {
      const id = await Examination.insert(input)
      return Examination.findOneById(id)
    },

    async updateExamination(root, { id, input }, { Examination }) {
      await Examination.updateById(id, input)
      return Examination.findOneById(id)
    },

    removeExamination(root, { id }, { Examination }) {
      return Examination.removeById(id)
    }
  }
}

export default resolvers
