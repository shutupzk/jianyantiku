const resolvers = {
  UserSign: {
    id(userSign) {
      return userSign._id
    },

    user(userSign, args, { UserSign }) {
      return UserSign.user(userSign)
    }
  },
  Query: {
    userSigns(root, { skip, limit }, { UserSign }) {
      return UserSign.all({ skip, limit })
    },

    userSign(root, { id }, { UserSign }) {
      return UserSign.findOneById(id)
    }
  },
  Mutation: {
    async createUserSign(root, { input }, { UserSign }) {
      const id = await UserSign.insert(input)
      return UserSign.findOneById(id)
    },

    async updateUserSign(root, { id, input }, { UserSign }) {
      await UserSign.updateById(id, input)
      return UserSign.findOneById(id)
    },

    removeUserSign(root, { id }, { UserSign }) {
      return UserSign.removeById(id)
    }
  }
}

export default resolvers
