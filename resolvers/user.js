const resolvers = {
  User: {
    id(user) {
      return user._id
    },

    exerciseCollects(user, { skip, limit }, { User }) {
      return User.exerciseCollects(user, { skip, limit })
    },

    userAnswers(user, { skip, limit }, { User }) {
      return User.userAnswers(user, { skip, limit })
    },

    decorations(user, { skip, limit }, { User }) {
      return User.decorations(user, { skip, limit })
    }

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
