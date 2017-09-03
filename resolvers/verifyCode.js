const resolvers = {
  VerifyCode: {
    id(verifyCode) {
      return verifyCode._id
    }
  },
  Query: {
    verifyCodes(root, { lastCreatedAt, skip, limit }, { VerifyCode }) {
      return VerifyCode.all({ lastCreatedAt, skip, limit })
    },

    verifyCode(root, { id }, { VerifyCode }) {
      return VerifyCode.findOneById(id)
    }
  },
  Mutation: {
    // 生成验证码
    async createVerifyCode(root, { input }, { VerifyCode }) {
      const id = await VerifyCode.insert(input)
      return VerifyCode.findOneById(id)
    },

    // 验证验证码
    async checkVerifyCode(root, { input }, { VerifyCode }) {
      const id = await VerifyCode.findAndUpdate(input)
      if (!id) return null
      return VerifyCode.findOneById(id)
    }
  }
}

export default resolvers
