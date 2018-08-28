const resolvers = {
  SubjectWithDiffculty: {
    id(subjectWithDiffculty) {
      return subjectWithDiffculty._id
    },

    subject(subjectWithDiffculty, args, { SubjectWithDiffculty }) {
      return SubjectWithDiffculty.subject(subjectWithDiffculty)
    },

    examinationDifficulty(subjectWithDiffculty, args, { SubjectWithDiffculty }) {
      return SubjectWithDiffculty.examinationDifficulty(subjectWithDiffculty)
    }
  },
  Query: {
    subjectWithDiffcultys(root, { skip, limit }, { SubjectWithDiffculty }) {
      return SubjectWithDiffculty.all({ skip, limit })
    },

    subjectWithDiffculty(root, { id }, { SubjectWithDiffculty }) {
      return SubjectWithDiffculty.findOneById(id)
    }
  },
  Mutation: {
    async createSubjectWithDiffculty(root, { input }, { SubjectWithDiffculty }) {
      const id = await SubjectWithDiffculty.insert(input)
      return SubjectWithDiffculty.findOneById(id)
    },

    async updateSubjectWithDiffculty(root, { id, input }, { SubjectWithDiffculty }) {
      await SubjectWithDiffculty.updateById(id, input)
      return SubjectWithDiffculty.findOneById(id)
    },

    removeSubjectWithDiffculty(root, { id }, { SubjectWithDiffculty }) {
      return SubjectWithDiffculty.removeById(id)
    }
  }
}

export default resolvers
