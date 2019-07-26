export default <T>(
  mapper: (value: T) => string,
  reducer: (a: T, b: T) => T,
  list: Array<T>,
) => {
  const values: {[key: string]: T} = {};
  for (let i = 0; i < list.length; i++) {
    const lval = mapper(list[i]);
    if (!(lval in values)) {
      values[lval] = list[i];
    } else {
      values[lval] = reducer(values[lval], list[i]);
    }
  }
  const output = [];
  for (let key in values) {
    if (values.hasOwnProperty(key)) {
      output.push(values[key]);
    }
  }
  return output;
};
