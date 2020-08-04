import { Maybe, Some } from './maybe';
/**
 * An object that represents the result of an operation that can either return a value successfully
 * or fail. Ty.
 * pically we'd simply either return a value or throw an error, but sometimes we perform
 * multiple operations as a batch, some of which may succeed and others fail. Since we can't
 * simultaneously return values and throw errors, we instead return collections of Result objects.
 * This allows a batch operation to return values for successful operations and errors for failed
 * ones without loss of information, namely the errors. (In contrast, sometimes it is appropriate
 * for a batch operation to return just successful values and omit values for failed operations.)
 *
 * Results are implemented as lightweight objects at runtime. This ensures they clearly appear as
 * Result objects when logging, inspecting, or otherwise using them.
 *
 * @param T The type of a successful operation's value if the result represents a success
 */

export enum ResultStatus {
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

/**
 * Creates a `Result` object from the given value, which can either be the result of a successful
 * operation or an error that occurred during it. This is the primary way to create `Result`
 * objects.
 *
 * @param value Either the successful result value or an error representing the failure reason. Omit
 * this argument if the operation was successful but conceptually doesn't return anything (void).
 * @returns A `Result` object that represents either a success or failure depending on the value
 * passed in
 */
export function result<T>(value: Error): Result<T>;
export function result<T>(value: T): Result<T> 
export function result(): Result<void>;

export function result<T>(value?: T | Maybe<T> | Maybe<null> | Error): Result<T> {
  if (value instanceof Error) return Result.Fail<T>(value as Error);
  if (value instanceof Maybe) return (value as Maybe<T>).toResult();
  if (value instanceof Result) {
    console.log('getting result', value.toJSON());
    return value;
  }

  return Result.Ok<T>(value as T);
}

/**
 * Converts a regular promise into one that always successfully resolves to a `Result` object.
 *
 * If the given promise is fulfilled, its fulfillment value is used to create a success result.
 *
 * Otherwise, if the given promise is rejected, its rejection reason is used to create a failure
 * result. If the given promise is rejected with a reason other than an `Error` object, the reason
 * is coerced to a string and used as the error message of a new `Error` object.
 *
 * @param promise A promise whose fulfillment value or rejection reason to use to create a `Result`
 * object
 * @returns A promise that always resolves to a `Result` object that represents either a success or
 * a failure depending on whether the given promise is fulfilled or rejected
 */
export async function asyncResult<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const value = await promise;
    return Success<T>(value);
  } catch (error) {
    return error instanceof Error ? Failure<T>(error) : Failure<T>(new Error(error));
  }
}

/**
 * Converts a promise that resolves to a `Result` object into a regular promise that either resolves
 * to a successful value or is rejected with an error. This function is the inverse of
 * `asyncResult`.
 *
 * @param resultPromise A promise that resolves to a result. The result is enforced to be a success;
 * if the result is a failure, the failure reason is thrown.
 * @returns A promise that either resolves to the success value of the input result or is rejected
 * with its failure reason
 *
export async function enforceAsyncResult<T>(resultPromise: Promise<Result<T>>): Promise<T> {
  const result = await resultPromise;
  return result.enforceValue();
}

*/

abstract class Outcome<T> {
  /**
   * Whether this result represents a success or a failure. Successes always have a result value and
   * never have a failure reason, while failures always have a failure reason and never have a
   * result value.
   *
   * This property is provided for convenience instead of checking the `status` property.
   */
  // abstract readonly ok: boolean;

  /**
   * The status of this result: either "fulfilled" or "rejected". This property and its possible
   * values are the same as the `status` field of standard promise results.
   */
  private _status: ResultStatus;
  private _value: Maybe<T> = Maybe<any>(null);

  /**
   * The reason the operation that created this result failed, if this result represents a failure.
   * This property is always `undefined` if this result represents a success.
   */
  private _reason: Error | undefined;

  constructor(status: ResultStatus, value?: T | Error, reason?: string | Error) {
    this._status = status;
    this._value = Some<T>(value as T);
    this._reason = (typeof reason === "string" ) ? new Error(reason) : reason;
  }

  /**
   * Returns the value of this result if it represents a success, or throws the underlying error if
   * this result represents a failure.
   */
  enforceValue(): T {
    if (!this.ok) {
      throw this._reason;
    }
    return this._value.value;
  }

  get status(): ResultStatus {
    return this._status;
  }

  get ok(): boolean {
    return this._status === ResultStatus.Fulfilled
  }

  get reason(): Error | undefined {
    return this._reason;
  }

  get value(): Maybe<T> {
    return this._value;
  }

  get valueUnsafe(): T {
    return this._value.value;
  }

  /**
   * Returns the error that caused this failure, or throws a TypeError if this result actually is a
   * success.
   */
  enforceError(): Error {
    if (this.ok) {
      throw new TypeError(`Expected result to have a failure reason but actually was a success`);
    }
    return this.reason!;
  }

  /**
   * Converts this result to an object that conforms to the same interface as a standard promise
   * result object.
   *
   * @returns The returned object may have property values that are not necessarily
   * JSON-serializable. It is the responsibility of each value to be JSON-serializable or for the
   * code performing serialization to anticipate non-serializable values.
   */
  toJSON(): object {
    const value = this._value.hasValue && this._value.value || undefined;
    return this.ok
      ? { status: ResultStatus.Fulfilled, value }
      : { status: ResultStatus.Rejected, reason: this.reason };
  }
}

export interface ResultHandler {
  (value?: Maybe<any> | Error): any | Result<any> | undefined
};

export interface AsyncResultHandler {
  (value?: Maybe<any> | Error): Promise<any> | Promise<Result<any>>
};

export class Result<T> extends Outcome<T> {
  [Symbol.toStringTag] = `Result: ${this.status.toUpperCase()}`;

  constructor(status: ResultStatus, value?: T, reason?: string | Error){
    super(status, value, reason);
  }

  onSuccess<T>(fn: ResultHandler): Result<T> {
    try {
      //@ts-ignore
      if (!this.ok) return this;

      const res = fn(this.value)
      if (res instanceof Result) return res;

      return result(res);
    } catch(err) {
      return Result.Fail<T>(err);
    }
  }

  onFailure<T>(fn: ResultHandler): Result<T> {
    try {
      //@ts-ignore
      if (this.ok) return this;

      const res = fn(this.reason)
      if (res instanceof Result) return res;
      
      return result<T>(res);
    } catch(err) {
      return Result.Fail<T>(err);
    }
  }

  match<T>(successFn: ResultHandler, failFn: ResultHandler): Result<T> {
    return Result.wrap(() => {
      if (!this.ok) return failFn(this.reason);

      return successFn(this.value);
    });
  }

  async matchAsync<T>(successFn: ResultHandler, failFn: ResultHandler): Promise<Result<T>> {
    return Result.wrapAsync(() => {
      if (!this.ok) return failFn(this.reason);

      return successFn(this.value);
    });
  }

  static Ok<T>(value: T): Result<T> {
    return Success<T>(value);
  }

  static Fail<T>(reason: string | Error): Result<T> {
    return Failure<T>(reason);
  }

  static wrap<T>(fn: Function): Result<T> {
    try {
      return result(fn());
    } catch (error) {
      return Failure<T>(error);
    }
  }

  static async wrapAsync<T>(fn: AsyncResultHandler | Promise<any>): Promise<Result<T>> {
    try {
      const val = (fn instanceof Promise) ? fn : fn()
      return result(await val);
    } catch (error) {
      return Failure<T>(error);
    }
  }
}

export function Success<T>(value: T): Result<T>{
  return new Result<T>(ResultStatus.Fulfilled, value);
}

export function Failure<T>(reason: string | Error): Result<T>{
  return new Result<T>(ResultStatus.Rejected, undefined, reason);
}