export function isString(value: unknown): boolean {
  return typeof value === "string";
}

export function isNumber(value: unknown): boolean {
  return typeof value === "number";
}

export function isObject(value: unknown): boolean {
  return typeof value === "object" && value !== null;
}

export function isFunction(value: unknown): boolean {
  return !!(value && {}.toString.call(value) === "[object Function]");
}

export function isBoolean(value: unknown): boolean {
  return typeof value === "boolean";
}
