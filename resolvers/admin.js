const resolvers = {
  Admin: {
    id(admin) {
      return admin._id
    }
  },
  Query: {
    admins(root, { skip, limit }, { Admin }) {
      return Admin.all({ skip, limit })
    },

    admin(root, { id }, { Admin }) {
      return Admin.findOneById(id)
    }
  },
  Mutation: {
    async createAdmin(root, { input }, { Admin, Patient }) {
      const id = await Admin.insert(input)
      return Admin.findOneById(id)
    },

    async updateAdmin(root, { id, input }, { Admin }) {
      await Admin.updateById(id, input)
      return Admin.findOneById(id)
    },

    removeAdmin(root, { id }, { Admin }) {
      return Admin.removeById(id)
    }
  }
}

export default resolvers
