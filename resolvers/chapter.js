const resolvers = {
  Chapter: {
    id(chapter) {
      return chapter._id
    },

    subject(chapter, args, { Chapter }) {
      return Chapter.subject(chapter)
    },

    sections(chapter, { skip, limit }, { Chapter }) {
      return Chapter.sections(chapter, { skip, limit })
    }
  },
  Query: {
    chapters(root, { skip, limit }, { Chapter }) {
      return Chapter.all({ skip, limit })
    },

    chapter(root, { id }, { Chapter }) {
      return Chapter.findOneById(id)
    }
  },
  Mutation: {
    async createChapter(root, { input }, { Chapter, Patient }) {
      const id = await Chapter.insert(input)
      return Chapter.findOneById(id)
    },

    async updateChapter(root, { id, input }, { Chapter }) {
      await Chapter.updateById(id, input)
      return Chapter.findOneById(id)
    },

    removeChapter(root, { id }, { Chapter }) {
      return Chapter.removeById(id)
    }
  }
}

export default resolvers
