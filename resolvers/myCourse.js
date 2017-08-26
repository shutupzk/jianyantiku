const resolvers = {
  MyCourse: {
    id(myCourse) {
      return myCourse._id
    },

    user(myCourse, args, { MyCourse }) {
      return MyCourse.user(myCourse)
    },

    course(myCourse, args, { MyCourse }) {
      return MyCourse.course(myCourse)
    }
  },
  Query: {
    myCourses(root, { skip, limit }, { MyCourse }) {
      return MyCourse.all({ skip, limit })
    },

    myCourse(root, { id }, { MyCourse }) {
      return MyCourse.findOneById(id)
    }
  },
  Mutation: {
    async createMyCourse(root, { input }, { MyCourse, Patient }) {
      const id = await MyCourse.insert(input)
      return MyCourse.findOneById(id)
    },

    async updateMyCourse(root, { id, input }, { MyCourse }) {
      await MyCourse.updateById(id, input)
      return MyCourse.findOneById(id)
    },

    removeMyCourse(root, { id }, { MyCourse }) {
      return MyCourse.removeById(id)
    }
  }
}

export default resolvers
