const resolvers = {
  ChapterWithDiffculty: {
    id(chapterWithDiffculty) {
      return chapterWithDiffculty._id
    },

    chapter(chapterWithDiffculty, args, { ChapterWithDiffculty }) {
      return ChapterWithDiffculty.chapter(chapterWithDiffculty)
    },

    examinationDifficulty(chapterWithDiffculty, args, { ChapterWithDiffculty }) {
      return ChapterWithDiffculty.examinationDifficulty(chapterWithDiffculty)
    }
  },
  Query: {
    chapterWithDiffcultys(root, { skip, limit }, { ChapterWithDiffculty }) {
      return ChapterWithDiffculty.all({ skip, limit })
    },

    chapterWithDiffculty(root, { id }, { ChapterWithDiffculty }) {
      return ChapterWithDiffculty.findOneById(id)
    }
  },
  Mutation: {
    async createChapterWithDiffculty(root, { input }, { ChapterWithDiffculty, Patient }) {
      const id = await ChapterWithDiffculty.insert(input)
      return ChapterWithDiffculty.findOneById(id)
    },

    async updateChapterWithDiffculty(root, { id, input }, { ChapterWithDiffculty }) {
      await ChapterWithDiffculty.updateById(id, input)
      return ChapterWithDiffculty.findOneById(id)
    },

    removeChapterWithDiffculty(root, { id }, { ChapterWithDiffculty }) {
      return ChapterWithDiffculty.removeById(id)
    }
  }
}

export default resolvers
