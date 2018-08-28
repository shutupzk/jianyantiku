const resolvers = {
  YearExerciseList: {
    id(yearExerciseList) {
      return yearExerciseList._id
    },

    yearExerciseType(yearExerciseList, args, { YearExerciseList }) {
      return YearExerciseList.yearExerciseType(yearExerciseList)
    },

    exercises(yearExerciseList, { skip, limit }, { YearExerciseList }) {
      return YearExerciseList.exercises(yearExerciseList, { skip, limit })
    },

    yearHasTypes(yearExerciseList, { skip, limit }, { YearExerciseList }) {
      return YearExerciseList.yearHasTypes(yearExerciseList, { skip, limit })
    }
  },
  Query: {
    yearExerciseLists(root, { skip, limit }, { YearExerciseList }) {
      return YearExerciseList.all({ skip, limit })
    },

    yearExerciseList(root, { id }, { YearExerciseList }) {
      return YearExerciseList.findOneById(id)
    }
  },
  Mutation: {
    async createYearExerciseList(root, { input }, { YearExerciseList }) {
      const id = await YearExerciseList.insert(input)
      return YearExerciseList.findOneById(id)
    },

    async updateYearExerciseList(root, { id, input }, { YearExerciseList }) {
      await YearExerciseList.updateById(id, input)
      return YearExerciseList.findOneById(id)
    },

    removeYearExerciseList(root, { id }, { YearExerciseList }) {
      return YearExerciseList.removeById(id)
    }
  }
}

export default resolvers
