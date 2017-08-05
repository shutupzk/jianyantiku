const resolvers = {
  ExerciseCollect: {
    id(exerciseCollect) {
      return exerciseCollect._id
    },

    user(exerciseCollect, args, { ExerciseCollect }) {
      return ExerciseCollect.user(exerciseCollect)
    },

    exercise(exerciseCollect, args, { ExerciseCollect }) {
      return ExerciseCollect.exercise(exerciseCollect)
    }
  },
  Query: {
    exerciseCollects(root, { skip, limit }, { ExerciseCollect }) {
      return ExerciseCollect.all({ skip, limit })
    },

    exerciseCollect(root, { id }, { ExerciseCollect }) {
      return ExerciseCollect.findOneById(id)
    }
  },
  Mutation: {
    async createExerciseCollect(root, { input }, { ExerciseCollect, Patient }) {
      const id = await ExerciseCollect.insert(input)
      return ExerciseCollect.findOneById(id)
    },

    async updateExerciseCollect(root, { id, input }, { ExerciseCollect }) {
      await ExerciseCollect.updateById(id, input)
      return ExerciseCollect.findOneById(id)
    },

    removeExerciseCollect(root, { id }, { ExerciseCollect }) {
      return ExerciseCollect.removeById(id)
    }
  }
}

export default resolvers
