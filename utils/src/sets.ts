
export function intersection<T>(...sets: Set<T>[]) {
  return sets.reduce((acc: Set<T>, set: Set<T>) => acc.intersection(set));
}

export function union<T>(...sets: Set<T>[]) {
  return sets.reduce((acc: any, set: any) => acc.union(set));
}

export function assertEqualSets<T>(
  setA: Set<T>, setA_name: string, setB: Set<T>, setB_name: string, errorMessage = "Sets did not match"
) {
  const inAbutNotInB = setA.difference(setB);
  const inBbutNotInA = setB.difference(setB);
  if (inAbutNotInB.size > 0 || inBbutNotInA.size > 0) {
    if (inAbutNotInB.size > 0) {
      console.error(`In ${setA_name} but not in ${setB_name}:`, inAbutNotInB);
    }
    if (inBbutNotInA.size > 0) {
      console.error(`In ${setB_name} but not in ${setA_name}:`, inBbutNotInA);
    }
    throw new Error(errorMessage);
  }
}
