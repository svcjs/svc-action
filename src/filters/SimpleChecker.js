function _cast (type, value) {
  let srcType = typeof value
  switch (type) {
    case 'int':
      if (srcType === 'boolean') return value ? 1 : 0
      if (!value) return 0
      return parseInt(value)
    case 'float':
      if (srcType === 'boolean') return value ? 1.0 : 0.0
      if (!value) return 0.0
      return parseFloat(value)
    case 'boolean':
      if (srcType === 'string') return value === '0' || value === '' || value.toLowerCase() === 'false' ? false : true
      return value ? true : false
    case 'string':
      if (srcType === 'boolean') return value ? 'true' : 'false'
      if (srcType === 'string') return value
      if (!value) return ''
      return value + ''
    case 'array':
      if (!(value instanceof Array)) {
        return [value]
      }
  }
  return value
}
var _checkRegexCache = {}

export default ({target, action, resolve, reject}, args) => {

  let checkDefines = target['_' + action]
  if (typeof checkDefines === 'object') {
    for (let field in checkDefines) {
      let define = checkDefines[field]
      let value = args[field]
      if (value === undefined) {
        if (define.require) {
          return reject(new Error(define.message || '[CHECK FAILED] ' + field + ' is requird'))
        }
      } else {
        if (define.type) {
          args[field] = _cast(define.type, value)
        }
        if (define.checker) {
          let checkOk = true
          if (typeof define.checker === 'function') {
            if (!define.checker(args[field])) checkOk = false
          } else {
            let strValue = _cast('string', value)
            if (!_checkRegexCache[define.checker]) _checkRegexCache[define.checker] = new RegExp(define.checker)
            checkOk = strValue.match(_checkRegexCache[define.checker]) !== null
          }
          if (!checkOk) {
            return reject(new Error(define.message || '[CHECK FAILED] ' + field + ':[' + value + '] check failed with ' + define.checker))
          }
        }
      }
    }
  }
  resolve()
}
