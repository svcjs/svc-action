export default class Action {
  constructor (contexts) {
    this._targets = {}
    this._initedTargets = {}
    this._filters = []
    this._contexts = []
    this._lastTargetName = ''
    if (contexts instanceof Array) {
      this._contexts = contexts
    } else if (typeof contexts === 'object') {
      this._contexts = [contexts]
    }
  }

  register (targetName, targetObject) {
    this._targets[targetName] = targetObject
  }

  unregister (targetName) {
    delete this._targets[targetName]
  }

  addFilter (filterObject) {
    this._filters.push(filterObject)
  }

  call (callName, actionArgs) {
    let that = this
    return new Promise(function (resolve, reject) {
      if (!actionArgs) actionArgs = {}
      let lastP = callName.lastIndexOf('.')
      if (lastP < 0) return reject(new Error('Action ' + callName + ' is not exists'))
      let targetName = callName.substr(0, lastP)
      let actionName = callName.substr(lastP + 1)
      if (!targetName && that._lastTargetName) {
        targetName = that._lastTargetName
      }
      let targetObject = that._targets[targetName]
      if (actionName.charAt(0) === '_') return reject(new Error('Action ' + actionName + ' on ' + targetName + ' is private'))
      if (!targetObject) return reject(new Error('Target ' + targetName + ' is not exists when called action ' + actionName))
      if (!targetObject[actionName]) return reject(new Error('Action ' + actionName + ' on ' + targetName + ' is not exists'))
      that._lastTargetName = targetName

      let actionContextArgs = that._makeContextArgs(targetObject, actionName, resolve, reject)
      if (targetObject['_init']) {
        if (!that._initedTargets[targetName]) {
          let initResolve = () => {
            that._initedTargets[targetName] = true
            that._callAction(targetObject, actionName, actionContextArgs, actionArgs)
          }
          let initContextArgs = that._makeContextArgs(targetObject, '_init', initResolve, reject)
          targetObject['_init'](initContextArgs)
          return
        }
      }

      that._callAction(targetObject, actionName, actionContextArgs, actionArgs)
    })
  }

  _makeContextArgs (targetObject, actionName, resolve, reject) {
    let contextArgs = {target: targetObject, action: actionName, actions: this, resolve: resolve, reject: reject}
    for (let context of this._contexts) {
      for (let key in context) {
        if (!contextArgs[key]) {
          contextArgs[key] = context[key]
          // console.log(key)
          // console.log(contextArgs)
        }
      }
    }
    return contextArgs
  }

  _callAction (targetObject, actionName, actionContextArgs, actionArgs) {
    if (this._filters.length === 0) {
      targetObject[actionName](actionContextArgs, actionArgs)
      return
    }

    let filterResolve = () => {
      targetObject[actionName](actionContextArgs, actionArgs)
    }
    let filterContextArgs = this._makeContextArgs(targetObject, actionName, filterResolve, actionContextArgs.reject)
    for (let i = this._filters.length - 1; i >= 0; i--) {
      let filter = this._filters[i]
      let nextFilterContextArgs = filterContextArgs
      filterResolve = () => {
        filter(nextFilterContextArgs, actionArgs)
      }
      filterContextArgs = this._makeContextArgs(targetObject, actionName, filterResolve, actionContextArgs.reject)
    }
    filterResolve()
  }
}
