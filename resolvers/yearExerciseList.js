const resolvers = {
  YearExerciseList: {
    id(yearExerciseList) {
      return yearExerciseList._id
    },

    examinationDifficulty(yearExerciseList, args, { YearExerciseList }) {
      return YearExerciseList.examinationDifficulty(yearExerciseList)
    },

    exercises(yearExerciseList, { skip, limit }, { YearExerciseList }) {
      return YearExerciseList.exercises(yearExerciseList, { skip, limit })
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
    async createYearExerciseList(root, { input }, { YearExerciseList, Patient }) {
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