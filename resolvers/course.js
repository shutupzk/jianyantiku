const resolvers = {
  Course: {
    id(course) {
      return course._id
    },

    courseType(course, args, { Course }) {
      return Course.courseType(course)
    }
  },
  Query: {
    courses(root, { skip, limit, hot }, { Course }) {
      return Course.all({ skip, limit, hot })
    },

    course(root, { id }, { Course }) {
      return Course.findOneById(id)
    }
  },
  Mutation: {
    async createCourse(root, { input }, { Course }) {
      const id = await Course.insert(input)
      return Course.findOneById(id)
    },

    async updateCourse(root, { id, input }, { Course }) {
      await Course.updateById(id, input)
      return Course.findOneById(id)
    },

    removeCourse(root, { id }, { Course }) {
      return Course.removeById(id)
    }
  }
}

export default resolvers
