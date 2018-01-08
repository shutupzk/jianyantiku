const resolvers = {
  Course: {
    id(course) {
      return course._id
    },

    async collect(exercise, { userId }, { CourseCollect }) {
      const exit = await CourseCollect.collection.findOne({exerciseId: exercise._id, userId})
      if (exit) {
        return true
      }
      return false
    },

    subject(course, args, {Course}) {
      return Course.subject(course)
    }
  },
  Query: {
    courses(root, { skip, limit, hot, type, subjectId }, { Course }) {
      return Course.all({ skip, limit, hot, type, subjectId })
    },

    course(root, { id }, { Course }) {
      return Course.findOneById(id)
    }
  },
  Mutation: {
    async createCourse(root, { input }, { Course }) {
      if (input.hot === 'true') {
        input.hot = true
      } else {
        input.hot = false
      }
      if (input.free === 'true') {
        input.free = true
      } else {
        input.free = false
      }
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
