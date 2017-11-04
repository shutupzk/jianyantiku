const resolvers = {
  RateOfProgressOfExamination: {
    id(rateOfProgressOfExamination) {
      return rateOfProgressOfExamination._id
    },

    user(rateOfProgressOfExamination, args, { RateOfProgressOfExamination }) {
      return RateOfProgressOfExamination.user(rateOfProgressOfExamination)
    },

    yearHasType(rateOfProgressOfExamination, args, { RateOfProgressOfExamination }) {
      return RateOfProgressOfExamination.yearHasType(rateOfProgressOfExamination)
    },

    examinationDifficulty(rateOfProgressOfExamination, args, { RateOfProgressOfExamination }) {
      return RateOfProgressOfExamination.examinationDifficulty(rateOfProgressOfExamination)
    },

    count(rateOfProgressOfExamination, args, { RateOfProgressOfExamination }) {
      return RateOfProgressOfExamination.count(rateOfProgressOfExamination)
    }

  },
  Query: {
    rateOfProgressOfExaminations(root, { skip, limit }, { RateOfProgressOfExamination }) {
      return RateOfProgressOfExamination.all({ skip, limit })
    },

    rateOfProgressOfExamination(root, { id }, { RateOfProgressOfExamination }) {
      return RateOfProgressOfExamination.findOneById(id)
    }
  },
  Mutation: {
    async createRateOfProgressOfExamination(root, { input }, { RateOfProgressOfExamination }) {
      const id = await RateOfProgressOfExamination.insert(input)
      return RateOfProgressOfExamination.findOneById(id)
    },

    async updateRateOfProgressOfExamination(root, { id, input }, { RateOfProgressOfExamination }) {
      await RateOfProgressOfExamination.updateById(id, input)
      return RateOfProgressOfExamination.findOneById(id)
    },

    removeRateOfProgressOfExamination(root, { id }, { RateOfProgressOfExamination }) {
      return RateOfProgressOfExamination.removeById(id)
    }
  }
}

export default resolvers
