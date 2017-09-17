const resolvers = {
  Payment: {
    id(payment) {
      return payment._id
    },

    user(payment, args, { Payment }) {
      return Payment.user(payment)
    }
  },
  Query: {
    payments(root, { skip, limit }, { Payment }) {
      return Payment.all({ skip, limit })
    },

    payment(root, { id }, { Payment }) {
      return Payment.findOneById(id)
    }
  },
  Mutation: {
    async createPayment(root, { input }, { Payment }) {
      const id = await Payment.insert(input)
      return Payment.findOneById(id)
    },

    async updatePayment(root, { id, input }, { Payment }) {
      await Payment.updateById(id, input)
      return Payment.findOneById(id)
    },

    removePayment(root, { id }, { Payment }) {
      return Payment.removeById(id)
    }
  }
}

export default resolvers
