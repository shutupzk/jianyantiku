const resolvers = {
  Service: {
    id(service) {
      return service._id
    }
  },
  Query: {
    services(root, { skip, limit }, { Service }) {
      return Service.all({ skip, limit })
    },

    service(root, { id }, { Service }) {
      return Service.findOneById(id)
    }
  },
  Mutation: {
    async createService(root, { input }, { Service }) {
      const id = await Service.insert(input)
      return Service.findOneById(id)
    },

    async updateService(root, { id, input }, { Service }) {
      await Service.updateById(id, input)
      return Service.findOneById(id)
    },

    removeService(root, { id }, { Service }) {
      return Service.removeById(id)
    }
  }
}

export default resolvers
