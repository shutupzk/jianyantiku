const resolvers = {
  ExerciseImage: {
    id(exerciseImage) {
      return exerciseImage._id
    },

    exercise(exerciseImage, args, { ExerciseImage }) {
      return ExerciseImage.exercise(exerciseImage)
    }
  },
  Query: {
    exerciseImages(root, { skip, limit }, { ExerciseImage }) {
      return ExerciseImage.all({ skip, limit })
    },

    exerciseImage(root, { id }, { ExerciseImage }) {
      return ExerciseImage.findOneById(id)
    }
  },
  Mutation: {
    async createExerciseImage(root, { input }, { ExerciseImage, Patient }) {
      const id = await ExerciseImage.insert(input)
      return ExerciseImage.findOneById(id)
    },

    async updateExerciseImage(root, { id, input }, { ExerciseImage }) {
      await ExerciseImage.updateById(id, input)
      return ExerciseImage.findOneById(id)
    },

    removeExerciseImage(root, { id }, { ExerciseImage }) {
      return ExerciseImage.removeById(id)
    }
  }
}

export default resolvers
