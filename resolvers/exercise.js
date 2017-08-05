const resolvers = {
  Exercise: {
    id(exercise) {
      return exercise._id
    },

    officialExamination(exercise, args, { Exercise }) {
      return Exercise.officialExamination(exercise)
    },

    mockExamination(exercise, args, { Exercise }) {
      return Exercise.mockExamination(exercise)
    },

    answers(exercise, { skip, limit }, { Exercise }) {
      return Exercise.answers(exercise, { skip, limit })
    },

    exerciseCollects(exercise, { skip, limit }, { Exercise }) {
      return Exercise.exerciseCollects(exercise, { skip, limit })
    },

    exerciseImages(exercise, { skip, limit }, { Exercise }) {
      return Exercise.exerciseImages(exercise, { skip, limit })
    }
  },
  Query: {
    exercises(root, { skip, limit }, { Exercise }) {
      return Exercise.all({ skip, limit })
    },

    exercise(root, { id }, { Exercise }) {
      return Exercise.findOneById(id)
    }
  },
  Mutation: {
    async createExercise(root, { input }, { Exercise, Patient }) {
      const id = await Exercise.insert(input)
      return Exercise.findOneById(id)
    },

    async updateExercise(root, { id, input }, { Exercise }) {
      await Exercise.updateById(id, input)
      return Exercise.findOneById(id)
    },

    removeExercise(root, { id }, { Exercise }) {
      return Exercise.removeById(id)
    }
  }
}

export default resolvers