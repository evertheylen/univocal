
export function identity<T>(arg: T) {
  return arg;
}

export function getTypeof(arg: any) {
  return typeof arg;
}

export function isInteger(arg: number) {
  return Number.isInteger(arg);
}

export function strLength(str: string) {
  return str.length;
}

export function matchesRegex(regex: RegExp, str: string) {
  return regex.test(str);
}
