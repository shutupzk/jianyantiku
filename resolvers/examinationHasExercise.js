const resolvers = {
  ExaminationHasExercise: {
    id(examinationHasExercise) {
      return examinationHasExercise._id
    },

    examination(examinationHasExercise, args, { ExaminationHasExercise }) {
      return ExaminationHasExercise.examination(examinationHasExercise)
    },

    exercise(examinationHasExercise, args, { ExaminationHasExercise }) {
      return ExaminationHasExercise.exercise(examinationHasExercise)
    },

    userAnswer(examinationHasExercise, args, { ExaminationHasExercise }) {
      return ExaminationHasExercise.userAnswer(examinationHasExercise)
    }
  },
  Query: {
    examinationHasExercises(root, { skip, limit }, { ExaminationHasExercise }) {
      return ExaminationHasExercise.all({ skip, limit })
    },
    examinationHasExercise(root, { id }, { ExaminationHasExercise }) {
      return ExaminationHasExercise.findOneById(id)
    }
  },
  Mutation: {
    async createExaminationHasExercise(root, { input }, { ExaminationHasExercise }) {
      const id = await ExaminationHasExercise.insert(input)
      return ExaminationHasExercise.findOneById(id)
    },

    async updateExaminationHasExercise(root, { id, input }, { ExaminationHasExercise }) {
      await ExaminationHasExercise.updateById(id, input)
      return ExaminationHasExercise.findOneById(id)
    },

    removeExaminationHasExercise(root, { id }, { ExaminationHasExercise }) {
      return ExaminationHasExercise.removeById(id)
    }
  }
}

export default resolvers
