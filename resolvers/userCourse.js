const resolvers = {
  UserCourse: {
    id(userCourse) {
      return userCourse._id
    },

    user(userCourse, args, { UserCourse }) {
      return UserCourse.user(userCourse)
    },

    course(userCourse, args, { UserCourse }) {
      return UserCourse.course(userCourse)
    }
  },
  Query: {
    userCourses(root, { skip, limit }, { UserCourse }) {
      return UserCourse.all({ skip, limit })
    },

    userCourse(root, { id }, { UserCourse }) {
      return UserCourse.findOneById(id)
    }
  },
  Mutation: {
    async createUserCourse(root, { input }, { UserCourse }) {
      const userCourse = await UserCourse.collection.findOne(input)
      if (userCourse) return userCourse
      const id = await UserCourse.insert(input)
      return UserCourse.findOneById(id)
    },

    async updateUserCourse(root, { id, input }, { UserCourse }) {
      await UserCourse.updateById(id, input)
      return UserCourse.findOneById(id)
    },

    removeUserCourse(root, { id }, { UserCourse }) {
      return UserCourse.removeById(id)
    }
  }
}

export default resolvers
