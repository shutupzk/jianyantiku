const resolvers = {
  UserInvitation: {
    id(userInvitation) {
      return userInvitation._id
    },

    user(userInvitation, args, { UserInvitation }) {
      return UserInvitation.user(userInvitation)
    }
  },
  Query: {
    userInvitations(root, { skip, limit }, { UserInvitation }) {
      return UserInvitation.all({ skip, limit })
    },

    userInvitation(root, { id }, { UserInvitation }) {
      return UserInvitation.findOneById(id)
    }
  },
  Mutation: {
    async createUserInvitation(root, { input }, { UserInvitation }) {
      const id = await UserInvitation.insert(input)
      return UserInvitation.findOneById(id)
    },

    async updateUserInvitation(root, { id, input }, { UserInvitation }) {
      await UserInvitation.updateById(id, input)
      return UserInvitation.findOneById(id)
    },

    removeUserInvitation(root, { id }, { UserInvitation }) {
      return UserInvitation.removeById(id)
    }
  }
}

export default resolvers
