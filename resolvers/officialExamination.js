const resolvers = {
  OfficialExamination: {
    id(officialExamination) {
      return officialExamination._id
    },

    exercises(officialExamination, { skip, limit }, { OfficialExamination }) {
      return OfficialExamination.exercises(officialExamination, { skip, limit })
    }
  },
  Query: {
    officialExaminations(root, { skip, limit }, { OfficialExamination }) {
      return OfficialExamination.all({ skip, limit })
    },

    officialExamination(root, { id }, { OfficialExamination }) {
      return OfficialExamination.findOneById(id)
    }
  },
  Mutation: {
    async createOfficialExamination(root, { input }, { OfficialExamination, Patient }) {
      const id = await OfficialExamination.insert(input)
      return OfficialExamination.findOneById(id)
    },

    async updateOfficialExamination(root, { id, input }, { OfficialExamination }) {
      await OfficialExamination.updateById(id, input)
      return OfficialExamination.findOneById(id)
    },

    removeOfficialExamination(root, { id }, { OfficialExamination }) {
      return OfficialExamination.removeById(id)
    }
  }
}

export default resolvers
