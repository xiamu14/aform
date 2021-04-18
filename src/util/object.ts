export function isEmpty(obj: Object) {
  return Object.keys(obj).length === 0
}

export function hasKey(obj:Object, key: string) {
  return Object.prototype.hasOwnProperty.bind(obj, key)
}
