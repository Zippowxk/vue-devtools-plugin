import {
  UNDEFINED,
  INFINITY,
  NEGATIVE_INFINITY,
  NAN,
  isPlainObject,
  escape,
  specialTokenToString
} from '@utils/util'

const rawTypeRE = /^\[object (\w+)]$/
const specialTypeRE = /^\[native (\w+) (.*?)(<>((.|\s)*))?\]$/

export function valueType (value) {
  const type = typeof value
  if (value == null || value === UNDEFINED) {
    return 'null'
  } else if (
    type === 'boolean' ||
    type === 'number' ||
    value === INFINITY ||
    value === NEGATIVE_INFINITY ||
    value === NAN
  ) {
    return 'literal'
  } else if (value && value._custom) {
    return 'custom'
  } else if (type === 'string') {
    const typeMatch = specialTypeRE.exec(value)
    if (typeMatch) {
      const [, type] = typeMatch
      return `native ${type}`
    } else {
      return 'string'
    }
  } else if (Array.isArray(value) || (value && value._isArray)) {
    return 'array'
  } else if (isPlainObject(value)) {
    return 'plain-object'
  } else {
    return 'unknown'
  }
}

export function formattedValue (value, quotes = true) {
  let result
  const type = valueType(value)
  if ((result = specialTokenToString(value))) {
    return result
  } else if (type === 'custom') {
    return value._custom.display
  } else if (type === 'array') {
    return 'Array[' + value.length + ']'
  } else if (type === 'plain-object') {
    return 'Object' + (Object.keys(value).length ? '' : ' (empty)')
  } else if (type.includes('native')) {
    return escape(specialTypeRE.exec(value)[2])
  } else if (typeof value === 'string') {
    const typeMatch = value.match(rawTypeRE)
    if (typeMatch) {
      value = escape(typeMatch[1])
    } else if (quotes) {
      value = `<span>"</span>${escape(value)}<span>"</span>`
    } else {
      value = escape(value)
    }
    value = value.replace(/ /g, '&nbsp;')
      .replace(/\n/g, '<span>\\n</span>')
  }
  return value
}

export function valueDetails (value: string) {
  const matched = specialTypeRE.exec(value)
  if (matched) {
    const [,,,, param] = matched
    return param
  }
  return null
}
