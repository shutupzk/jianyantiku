const resolvers = {
  CoursesType: {
    id(coursesType) {
      return coursesType._id
    },

    courses(coursesType, { skip, limit }, { CoursesType }) {
      return CoursesType.courses(coursesType, { skip, limit })
    }
  },
  Query: {
    coursesTypes(root, { skip, limit }, { CoursesType }) {
      return CoursesType.all({ skip, limit })
    },

    coursesType(root, { id }, { CoursesType }) {
      return CoursesType.findOneById(id)
    }
  },
  Mutation: {
    async createCoursesType(root, { input }, { CoursesType }) {
      const id = await CoursesType.insert(input)
      return CoursesType.findOneById(id)
    },

    async updateCoursesType(root, { id, input }, { CoursesType }) {
      await CoursesType.updateById(id, input)
      return CoursesType.findOneById(id)
    },

    removeCoursesType(root, { id }, { CoursesType }) {
      return CoursesType.removeById(id)
    }
  }
}

export default resolvers
