const resolvers = {
  Note: {
    id(note) {
      return note._id
    },

    user(note, args, { Note }) {
      return Note.user(note)
    },

    exercise(note, args, { Note }) {
      return Note.exercise(note)
    }
  },
  Query: {
    notes(root, { skip, limit }, { Note }) {
      return Note.all({ skip, limit })
    },

    note(root, { id }, { Note }) {
      return Note.findOneById(id)
    }
  },
  Mutation: {
    async createNote(root, { input }, { Note, Patient }) {
      const id = await Note.insert(input)
      return Note.findOneById(id)
    },

    async updateNote(root, { id, input }, { Note }) {
      await Note.updateById(id, input)
      return Note.findOneById(id)
    },

    removeNote(root, { id }, { Note }) {
      return Note.removeById(id)
    }
  }
}

export default resolvers
