const resolvers = {
  UserExerciseTime: {
    id(userExerciseTime) {
      return userExerciseTime._id
    },

    user(userExerciseTime, args, { UserExerciseTime }) {
      return UserExerciseTime.user(userExerciseTime)
    },

    totalCount(userExerciseTime, args, { UserExerciseTime }) {
      return UserExerciseTime.totalCount(userExerciseTime)
    },

    rightCount(userExerciseTime, args, { UserExerciseTime }) {
      return UserExerciseTime.rightCount(userExerciseTime)
    },

    errorCount(userExerciseTime, args, { UserExerciseTime }) {
      return UserExerciseTime.errorCount(userExerciseTime)
    },

    rightRate(userExerciseTime, args, { UserExerciseTime }) {
      return UserExerciseTime.rightRate(userExerciseTime)
    }
  },
  Query: {
    userExerciseTimes(root, { skip, limit }, { UserExerciseTime }) {
      return UserExerciseTime.all({ skip, limit })
    },

    userExerciseTime(root, { id }, { UserExerciseTime }) {
      return UserExerciseTime.findOneById(id)
    }
  },
  Mutation: {
    async createUserExerciseTime(root, { input }, { UserExerciseTime }) {
      const { userId } = input
      let times = 1
      const userExerciseTimes = await UserExerciseTime.collection
        .find({ userId })
        .sort({ times: -1 })
        .limit(1)
        .toArray()
      if (userExerciseTimes && userExerciseTimes.length > 0) {
        times += userExerciseTimes[0].times
      }
      const id = await UserExerciseTime.insert({ userId, times })
      return UserExerciseTime.findOneById(id)
    },

    async updateUserExerciseTime(root, { id, input }, { UserExerciseTime }) {
      await UserExerciseTime.updateById(id, input)
      return UserExerciseTime.findOneById(id)
    },

    removeUserExerciseTime(root, { id }, { UserExerciseTime }) {
      return UserExerciseTime.removeById(id)
    }
  }
}

export default resolvers
