import * as is from './is';
import { Result } from './result';

export interface Handler {
  (value?: any): any
};

export type Maybe<T> = {
  isNone: Boolean,
  hasValue: Boolean,
  value: T,
  map<T>(fn: Handler): Maybe<T> | Maybe<null>,
  match(someFn: Handler, noneFn: Handler): Maybe<T>,
  toResult<T>(reason?: string): Result<T>
}

export interface None { 
  (): Maybe<null>,
  toResult<T>(reason?: string): Result<T>
}

export function Maybe<T>(val: T, defaultValue?: any): Maybe<T> {
  if (is.nothing(val)) val = defaultValue;

  const isNone = is.nothing(val);
  const hasValue = !isNone;

  return {
    isNone, hasValue,

    get value(): T {
      if (isNone) throw new Error('Cannot reference value of None.');
      return val;
    },

    map<T>(fn: Handler): Maybe<T> | Maybe<null> {
      if (isNone) return None();
      return Some<T>(fn(this.value));
    },

    match(someFn: Handler, noneFn: Handler): Maybe<any> {
      return isNone 
        ? Maybe(noneFn())
        : Maybe(someFn(val))
    }, 

    toResult<T>(reason?: string): Result<T>{
      try {
        if (isNone) return Result.Fail<T>(
          reason || 'None cannot be turned into a successful result.'
        );
        return Result.Ok<T>(this.value as any);
      } catch(err){
        return Result.Fail<T>(err);
      }
    }
  }
}

export function Some<T>(value: T): Maybe<T> {
  return Maybe<T>(value);
}

export function None(): Maybe<null> {
  return Maybe<null>(null);
}
