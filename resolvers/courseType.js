const resolvers = {
  CourseType: {
    id(courseType) {
      return courseType._id
    },

    courses(courseType, { skip, limit }, { CourseType }) {
      return CourseType.courses(courseType, { skip, limit })
    }
  },
  Query: {
    courseTypes(root, { skip, limit }, { CourseType }) {
      return CourseType.all({ skip, limit })
    },

    courseType(root, { id }, { CourseType }) {
      return CourseType.findOneById(id)
    }
  },
  Mutation: {
    async createCourseType(root, { input }, { CourseType }) {
      const id = await CourseType.insert(input)
      return CourseType.findOneById(id)
    },

    async updateCourseType(root, { id, input }, { CourseType }) {
      await CourseType.updateById(id, input)
      return CourseType.findOneById(id)
    },

    removeCourseType(root, { id }, { CourseType }) {
      return CourseType.removeById(id)
    }
  }
}

export default resolvers
