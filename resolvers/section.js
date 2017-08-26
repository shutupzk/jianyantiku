const resolvers = {
  Section: {
    id(section) {
      return section._id
    },

    chapter(section, args, { Section }) {
      return Section.chapter(section)
    },

    exercises(section, { skip, limit }, { Section }) {
      return Section.exercises(section, { skip, limit })
    }
  },
  Query: {
    sections(root, { skip, limit }, { Section }) {
      return Section.all({ skip, limit })
    },

    section(root, { id }, { Section }) {
      return Section.findOneById(id)
    }
  },
  Mutation: {
    async createSection(root, { input }, { Section, Patient }) {
      const id = await Section.insert(input)
      return Section.findOneById(id)
    },

    async updateSection(root, { id, input }, { Section }) {
      await Section.updateById(id, input)
      return Section.findOneById(id)
    },

    removeSection(root, { id }, { Section }) {
      return Section.removeById(id)
    }
  }
}

export default resolvers