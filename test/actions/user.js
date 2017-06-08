module.exports = {

  inited: false,
  logined: false,

  _init: function ({resolve, reject}) {
    this.inited = true
    resolve()
  },

  _login: {
    userId: {
      type: 'int',
      checker: '^\\d+$'
    },
    password: {
      type: 'string',
      require: true,
      checker: (value) => {
        return value.length >= 6
      }
    }
  },
  login: function ({resolve, reject}, {userId, password}) {
    this.logined = true
    if (userId === 31 && password === '123456') {
      resolve()
    } else {
      reject(new Error('Login failed'))
    }
  },

  _testChecker: {
    newType: {
      type: 'newType'
    },
    float: {
      type: 'float'
    },
    boolean: {
      type: 'boolean'
    },
    array: {
      type: 'array',
      checker: (value) => {
        return value[0] === 111
      }
    }
  },
  testChecker: function ({target, resolve, reject}, args) {
    target.newType = args.newType
    target.float = args.float
    target.boolean = args.boolean
    target.array = args.array
    resolve()
  },

  isLogined: function ({resolve, reject}) {
    resolve(this.logined)
  },

  tryLogin: function ({actions, resolve, reject}) {
    actions.call()
    // resolve(this.logined)
  }

}
