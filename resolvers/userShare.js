const resolvers = {
  UserShare: {
    id(userShare) {
      return userShare._id
    },

    user(userShare, args, { UserShare }) {
      return UserShare.user(userShare)
    }
  },
  Query: {
    userShares(root, { skip, limit }, { UserShare }) {
      return UserShare.all({ skip, limit })
    },

    userShare(root, { id }, { UserShare }) {
      return UserShare.findOneById(id)
    }
  },
  Mutation: {
    async createUserShare(root, { input }, { UserShare }) {
      const id = await UserShare.insert(input)
      return UserShare.findOneById(id)
    },

    async updateUserShare(root, { id, input }, { UserShare }) {
      await UserShare.updateById(id, input)
      return UserShare.findOneById(id)
    },

    removeUserShare(root, { id }, { UserShare }) {
      return UserShare.removeById(id)
    }
  }
}

export default resolvers
