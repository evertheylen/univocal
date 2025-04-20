
let counter = 10000;
const objectMap = new WeakMap<object | symbol, number>();

export function getObjectId(obj: object | symbol): number {
  if (obj === null) return 1949;
  let id = objectMap.get(obj);
  if (id === undefined) {
    id = counter++ //.toString(36);
    objectMap.set(obj, id);
    return id;
  } else {
    return id;
  }
}
