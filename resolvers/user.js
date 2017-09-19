const resolvers = {
  User: {
    id(user) {
      return user._id
    },

    exerciseCollects(user, { skip, limit }, { User }) {
      return User.exerciseCollects(user, { skip, limit })
    },
    courseCollects(user, { skip, limit }, { User }) {
      return User.courseCollects(user, { skip, limit })
    },

    userAnswers(user, { skip, limit, isAnswer, subjectId }, { User }) {
      return User.userAnswers(user, { skip, limit, isAnswer, subjectId })
    },

    decorations(user, { skip, limit }, { User }) {
      return User.decorations(user, { skip, limit })
    },

    scoreRecords(user, { skip, limit, date }, { User }) {
      return User.scoreRecords(user, { skip, limit, date })
    },

    examinations(user, { skip, limit }, { User }) {
      return User.examinations(user, { skip, limit })
    },

    rateOfProgressOfSections(user, { skip, limit }, { User }) {
      return User.rateOfProgressOfSections(user, { skip, limit })
    },

    userSigns(user, { skip, limit }, { User }) {
      return User.userSigns(user, { skip, limit })
    },

    userShares(user, { skip, limit }, { User }) {
      return User.userShares(user, { skip, limit })
    },

    userInvitations(user, { skip, limit }, { User }) {
      return User.userInvitations(user, { skip, limit })
    },

    countCourseCollect(user, args, { User }) {
      return User.countCourseCollect(user)
    }

    // countUserAnswer(user, args, { User }) {
    //   return User.countUserAnswer(user)
    // },

    // countRightUserAnswer(user, args, { User }) {
    //   return User.countRightUserAnswer(user)
    // }
  },
  Query: {
    users(root, { skip, limit }, { User }) {
      return User.all({ skip, limit })
    },

    user(root, { id }, { User }) {
      return User.findOneById(id)
    }
  },
  Mutation: {
    async signUp(root, { input }, { User, Patient }) {
      const id = await User.insert(input)
      return User.findOneById(id)
    },

    async updateUser(root, { id, input }, { User }) {
      await User.updateById(id, input)
      return User.findOneById(id)
    },

    async updatePassword(root, { phone, input }, { User }) {
      const id = await User.updateByPhone(phone, input)
      return User.findOneById(id)
    },

    removeUser(root, { id }, { User }) {
      return User.removeById(id)
    }
  }
}

export default resolvers
