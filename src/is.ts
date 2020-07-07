export const none = (testValue: any): Boolean =>
  !testValue && typeof testValue === "object";

export const objectType = (testValue: any): Boolean =>
  !!testValue && typeof testValue === "object";

export const object = (testValue: any): Boolean =>
  objectType(testValue) && testValue.constructor !== Array;

export const array = (testValue: any): Boolean =>
  objectType(testValue) && testValue.constructor === Array;

export const callable = (testValue: any): Boolean =>
  typeof testValue === "function";

export const defined = (testValue: any): Boolean =>
  typeof testValue !== "undefined";

export const nothing = (testValue: any): Boolean =>
  testValue === null || !defined(testValue);

export const string = (testValue: any): Boolean =>
  typeof testValue === "string";

export const number = (testValue: any): Boolean =>
  typeof testValue === "number" && !Number.isNaN(testValue);

// Class
export const a = (testValue: any, typeConstructor: any) =>
  (objectType(testValue) || callable(testValue)) && testValue.constructor === typeConstructor;

// Promise
export const promise = (testValue: any): Boolean =>
  objectType(testValue) && callable(testValue.then);
