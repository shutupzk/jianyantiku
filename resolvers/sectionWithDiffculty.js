const resolvers = {
  SectionWithDiffculty: {
    id(sectionWithDiffculty) {
      return sectionWithDiffculty._id
    },

    section(sectionWithDiffculty, args, { SectionWithDiffculty }) {
      return SectionWithDiffculty.section(sectionWithDiffculty)
    },

    examinationDifficulty(sectionWithDiffculty, args, { SectionWithDiffculty }) {
      return SectionWithDiffculty.examinationDifficulty(sectionWithDiffculty)
    }
  },
  Query: {
    sectionWithDiffcultys(root, { skip, limit }, { SectionWithDiffculty }) {
      return SectionWithDiffculty.all({ skip, limit })
    },

    sectionWithDiffculty(root, { id }, { SectionWithDiffculty }) {
      return SectionWithDiffculty.findOneById(id)
    }
  },
  Mutation: {
    async createSectionWithDiffculty(root, { input }, { SectionWithDiffculty }) {
      const id = await SectionWithDiffculty.insert(input)
      return SectionWithDiffculty.findOneById(id)
    },

    async updateSectionWithDiffculty(root, { id, input }, { SectionWithDiffculty }) {
      await SectionWithDiffculty.updateById(id, input)
      return SectionWithDiffculty.findOneById(id)
    },

    removeSectionWithDiffculty(root, { id }, { SectionWithDiffculty }) {
      return SectionWithDiffculty.removeById(id)
    }
  }
}

export default resolvers
