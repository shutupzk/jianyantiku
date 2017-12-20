const resolvers = {
  Version: {
    id(version) {
      return version._id
    }
  },
  Query: {
    versions(root, { lastCreatedAt, skip, limit, type }, { Version }) {
      return Version.all({ lastCreatedAt, skip, limit, type })
    },

    version(root, { id }, { Version }) {
      return Version.findOneById(id)
    }
  },
  Mutation: {
    async createVersion(root, { input }, { Version }) {
      const id = await Version.insert(input)
      return Version.findOneById(id)
    },

    async updateVersion(root, { id, input }, { Version }) {
      await Version.updateById(id, input)
      return Version.findOneById(id)
    },

    removeVersion(root, { id }, { Version }) {
      return Version.removeById(id)
    }
  }
}

export default resolvers
