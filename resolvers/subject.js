const resolvers = {
  Subject: {
    id(subject) {
      return subject._id
    },

    chapters(subject, { skip, limit }, { Subject }) {
      return Subject.chapters(subject, { skip, limit })
    }
  },
  Query: {
    subjects(root, { skip, limit }, { Subject }) {
      return Subject.all({ skip, limit })
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
