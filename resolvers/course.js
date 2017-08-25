const resolvers = {
  Course: {
    id(course) {
      return course._id
    },

    chapters(course, { skip, limit }, { Course }) {
      return Course.chapters(course, { skip, limit })
    }
  },
  Query: {
    courses(root, { skip, limit }, { Course }) {
      return Course.all({ skip, limit })
    },

    course(root, { id }, { Course }) {
      return Course.findOneById(id)
    }
  },
  Mutation: {
    async createCourse(root, { input }, { Course, Patient }) {
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
