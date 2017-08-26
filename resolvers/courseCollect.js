const resolvers = {
  CourseCollect: {
    id(courseCollect) {
      return courseCollect._id
    },

    user(courseCollect, args, { CourseCollect }) {
      return CourseCollect.user(courseCollect)
    },

    course(courseCollect, args, { CourseCollect }) {
      return CourseCollect.course(courseCollect)
    }
  },
  Query: {
    courseCollects(root, { skip, limit }, { CourseCollect }) {
      return CourseCollect.all({ skip, limit })
    },

    courseCollect(root, { id }, { CourseCollect }) {
      return CourseCollect.findOneById(id)
    }
  },
  Mutation: {
    async createCourseCollect(root, { input }, { CourseCollect, Patient }) {
      const id = await CourseCollect.insert(input)
      return CourseCollect.findOneById(id)
    },

    async updateCourseCollect(root, { id, input }, { CourseCollect }) {
      await CourseCollect.updateById(id, input)
      return CourseCollect.findOneById(id)
    },

    removeCourseCollect(root, { id }, { CourseCollect }) {
      return CourseCollect.removeById(id)
    }
  }
}

export default resolvers
