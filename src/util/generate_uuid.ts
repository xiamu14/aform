const uuid = () =>
  Date.now() +
  Math.random()
    .toString(36)
    .substr(2)

export default uuid
