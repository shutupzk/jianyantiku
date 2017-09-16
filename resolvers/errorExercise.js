const resolvers = {
  ErrorExercise: {
    id(errorExercise) {
      return errorExercise._id
    },

    user(errorExercise, args, { ErrorExercise }) {
      return ErrorExercise.user(errorExercise)
    },

    exercise(errorExercise, args, { ErrorExercise }) {
      return ErrorExercise.exercise(errorExercise)
    }
  },
  Query: {
    errorExercises(root, { skip, limit }, { ErrorExercise }) {
      return ErrorExercise.all({ skip, limit })
    },

    errorExercise(root, { id }, { ErrorExercise }) {
      return ErrorExercise.findOneById(id)
    }
  },
  Mutation: {
    async createErrorExercise(root, { input }, { ErrorExercise, Patient }) {
      const id = await ErrorExercise.insert(input)
      return ErrorExercise.findOneById(id)
    },

    async updateErrorExercise(root, { id, input }, { ErrorExercise }) {
      await ErrorExercise.updateById(id, input)
      return ErrorExercise.findOneById(id)
    },

    removeErrorExercise(root, { id }, { ErrorExercise }) {
      return ErrorExercise.removeById(id)
    }
  }
}

export default resolvers
