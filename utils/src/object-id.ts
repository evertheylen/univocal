
let counter = 10000;
const objectMap = new WeakMap<object | symbol, string>();

export function getObjectId(obj: object | symbol): string {
  if (obj === null) return '@';
  let id = objectMap.get(obj);
  if (id === undefined) {
    id = (counter++).toString(36);
    objectMap.set(obj, id);
    return id;
  } else {
    return id;
  }
}
