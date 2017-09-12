const resolvers = {
  YearExerciseType: {
    id(yearExerciseType) {
      return yearExerciseType._id
    },

    examinationDifficulty(yearExerciseType, args, { YearExerciseType }) {
      return YearExerciseType.examinationDifficulty(yearExerciseType)
    },

    yearExerciseLists(yearExerciseType, { skip, limit }, { YearExerciseType }) {
      return YearExerciseType.yearExerciseLists(yearExerciseType, { skip, limit })
    }
  },
  Query: {
    yearExerciseTypes(root, { skip, limit }, { YearExerciseType }) {
      return YearExerciseType.all({ skip, limit })
    },

    yearExerciseType(root, { id }, { YearExerciseType }) {
      return YearExerciseType.findOneById(id)
    }
  },
  Mutation: {
    async createYearExerciseType(root, { input }, { YearExerciseType, Patient }) {
      const id = await YearExerciseType.insert(input)
      return YearExerciseType.findOneById(id)
    },

    async updateYearExerciseType(root, { id, input }, { YearExerciseType }) {
      await YearExerciseType.updateById(id, input)
      return YearExerciseType.findOneById(id)
    },

    removeYearExerciseType(root, { id }, { YearExerciseType }) {
      return YearExerciseType.removeById(id)
    }
  }
}

export default resolvers
