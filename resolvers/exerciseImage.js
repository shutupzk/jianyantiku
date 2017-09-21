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
    async createExerciseImage(root, { input }, { ExerciseImage }) {
      const id = await ExerciseImage.insert(input)
      return ExerciseImage.findOneById(id)
    },

    async createExerciseImages(root, { inputs }, { ExerciseImage, Exercise }) {
      const { exerciseId } = inputs[0]
      await ExerciseImage.collection.deleteMany({ exerciseId })
      for (let input of inputs) {
        await ExerciseImage.insert(input)
      }
      return Exercise.findOneById(exerciseId)
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
