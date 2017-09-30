const resolvers = {
  RateOfProgressOfSection: {
    id(rateOfProgressOfSection) {
      return rateOfProgressOfSection._id
    },

    user(rateOfProgressOfSection, args, { RateOfProgressOfSection }) {
      return RateOfProgressOfSection.user(rateOfProgressOfSection)
    },

    section(rateOfProgressOfSection, args, { RateOfProgressOfSection }) {
      return RateOfProgressOfSection.section(rateOfProgressOfSection)
    },

    examinationDifficulty(rateOfProgressOfSection, args, { RateOfProgressOfSection }) {
      return RateOfProgressOfSection.examinationDifficulty(rateOfProgressOfSection)
    },

    count(rateOfProgressOfSection, args, { RateOfProgressOfSection }) {
      return RateOfProgressOfSection.count(rateOfProgressOfSection)
    }

  },
  Query: {
    rateOfProgressOfSections(root, { skip, limit }, { RateOfProgressOfSection }) {
      return RateOfProgressOfSection.all({ skip, limit })
    },

    rateOfProgressOfSection(root, { id }, { RateOfProgressOfSection }) {
      return RateOfProgressOfSection.findOneById(id)
    }
  },
  Mutation: {
    async createRateOfProgressOfSection(root, { input }, { RateOfProgressOfSection }) {
      const id = await RateOfProgressOfSection.insert(input)
      return RateOfProgressOfSection.findOneById(id)
    },

    async updateRateOfProgressOfSection(root, { id, input }, { RateOfProgressOfSection }) {
      await RateOfProgressOfSection.updateById(id, input)
      return RateOfProgressOfSection.findOneById(id)
    },

    removeRateOfProgressOfSection(root, { id }, { RateOfProgressOfSection }) {
      return RateOfProgressOfSection.removeById(id)
    }
  }
}

export default resolvers
