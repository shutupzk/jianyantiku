const resolvers = {
  UserHasDecoration: {
    id(userHasDecoration) {
      return userHasDecoration._id
    },

    user(userHasDecoration, args, { UserHasDecoration }) {
      return UserHasDecoration.user(userHasDecoration)
    },

    decoration(userHasDecoration, args, { UserHasDecoration }) {
      return UserHasDecoration.decoration(userHasDecoration)
    }
  },
  Query: {
    userHasDecorations(root, { skip, limit }, { UserHasDecoration }) {
      return UserHasDecoration.all({ skip, limit })
    },

    userHasDecoration(root, { id }, { UserHasDecoration }) {
      return UserHasDecoration.findOneById(id)
    }
  },
  Mutation: {
    async createUserHasDecoration(root, { input }, { UserHasDecoration, Patient }) {
      const id = await UserHasDecoration.insert(input)
      return UserHasDecoration.findOneById(id)
    },

    async updateUserHasDecoration(root, { id, input }, { UserHasDecoration }) {
      await UserHasDecoration.updateById(id, input)
      return UserHasDecoration.findOneById(id)
    },

    removeUserHasDecoration(root, { id }, { UserHasDecoration }) {
      return UserHasDecoration.removeById(id)
    }
  }
}

export default resolvers
