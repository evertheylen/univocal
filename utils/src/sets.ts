
export function intersection<T>(...sets: Set<T>[]) {
  return sets.reduce((acc: Set<T>, set: Set<T>) => acc.intersection(set));
}
