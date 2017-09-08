const resolvers = {
  Exercise: {
    id(exercise) {
      return exercise._id
    },

    section(exercise, args, { Exercise }) {
      return Exercise.section(exercise)
    },

    subject(exercise, args, { Exercise }) {
      return Exercise.subject(exercise)
    },

    yearExerciseList(exercise, args, { Exercise }) {
      return Exercise.yearExerciseList(exercise)
    },

    mockExamination(exercise, args, { Exercise }) {
      return Exercise.mockExamination(exercise)
    },

    examinationDifficulty(exercise, args, { Exercise }) {
      return Exercise.examinationDifficulty(exercise)
    },

    answers(exercise, { skip, limit }, { Exercise }) {
      return Exercise.answers(exercise, { skip, limit })
    },

    exerciseCollects(exercise, { skip, limit }, { Exercise }) {
      return Exercise.exerciseCollects(exercise, { skip, limit })
    },

    exerciseImages(exercise, { skip, limit }, { Exercise }) {
      return Exercise.exerciseImages(exercise, { skip, limit })
    },

    notes(exercise, { skip, limit, userId }, { Exercise }) {
      return Exercise.notes(exercise, { skip, limit, userId })
    },

    analysiss(exercise, { skip, limit }, { Exercise }) {
      return Exercise.analysiss(exercise, { skip, limit })
    }
  },
  Query: {
    exercises(root, { skip, limit, hot, type, examinationDifficultyId, yearExerciseListId, subjectId, chapterId, sectionId }, { Exercise }) {
      return Exercise.all({ skip, limit, hot, type, examinationDifficultyId, yearExerciseListId, subjectId, chapterId, sectionId })
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
