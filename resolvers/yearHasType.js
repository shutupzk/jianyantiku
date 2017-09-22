const resolvers = {
  YearHasType: {
    id(yearHasType) {
      return yearHasType._id
    },

    yearExamType(yearHasType, args, { YearHasType }) {
      return YearHasType.yearExamType(yearHasType)
    },

    yearExerciseList(yearHasType, args, { YearHasType }) {
      return YearHasType.yearExerciseList(yearHasType)
    },

    exercises(yearHasType, { skip, limit }, { YearHasType }) {
      return YearHasType.exercises(yearHasType, { skip, limit })
    },

    count(yearHasType, args, { YearHasType }) {
      return YearHasType.count(yearHasType)
    }
  },
  Query: {
    yearHasTypes(root, { skip, limit }, { YearHasType }) {
      return YearHasType.all({ skip, limit })
    },

    yearHasType(root, { id }, { YearHasType }) {
      return YearHasType.findOneById(id)
    }
  },
  Mutation: {
    async createYearHasType(root, { input }, { YearHasType }) {
      const id = await YearHasType.insert(input)
      return YearHasType.findOneById(id)
    },

    async updateYearHasType(root, { id, input }, { YearHasType }) {
      await YearHasType.updateById(id, input)
      return YearHasType.findOneById(id)
    },

    removeYearHasType(root, { id }, { YearHasType }) {
      return YearHasType.removeById(id)
    }
  }
}

export default resolvers
