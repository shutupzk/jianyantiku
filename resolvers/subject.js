const resolvers = {
  Subject: {
    id(subject) {
      return subject._id
    },

    chapters(subject, { skip, limit, examinationDifficultyId }, { Subject }) {
      return Subject.chapters(subject, { skip, limit, examinationDifficultyId })
    },

    exercises(subject, { skip, limit, hot }, { Subject }) {
      return Subject.exercises(subject, { skip, limit, hot })
    },

    subjectWithDiffcultys(subject, { skip, limit, hot }, { Subject }) {
      return Subject.subjectWithDiffcultys(subject, { skip, limit, hot })
    },

    hotCount(subject, args, { Subject }) {
      return Subject.hotCount(subject)
    },

    errorCount(subject, { userId }, { Subject }) {
      return Subject.errorCount(subject, { userId })
    }
  },
  Query: {
    subjects(root, { skip, limit, examinationDifficultyId }, { Subject }) {
      return Subject.all({ skip, limit, examinationDifficultyId })
    },

    subject(root, { id }, { Subject }) {
      return Subject.findOneById(id)
    }
  },
  Mutation: {
    async createSubject(root, { input }, { Subject, Patient }) {
      const id = await Subject.insert(input)
      return Subject.findOneById(id)
    },

    async updateSubject(root, { id, input }, { Subject }) {
      await Subject.updateById(id, input)
      return Subject.findOneById(id)
    },

    removeSubject(root, { id }, { Subject }) {
      return Subject.removeById(id)
    }
  }
}

export default resolvers
