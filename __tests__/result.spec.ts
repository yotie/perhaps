import { ResultStatus, asyncResult, result, Result, Failure, Success } from '../src/result';
import { Some, None, Maybe } from '../src/maybe';

describe('result', () => {
  test(`creates a success result`, () => {
    const success = result('Success!');
    expect(success.ok).toBe(true);
    expect(success.status).toBe(ResultStatus.Fulfilled);
    expect(success.value.value).toBe('Success!');
    expect(success.valueUnsafe).toBe('Success!');
    expect(success.reason).toBeUndefined();
    expect(success.enforceValue()).toBe('Success!');
    expect(() => success.enforceError()).toThrowError();
  });

  test(`creates a void success result`, () => {
    const success = result();
    expect(success.ok).toBe(true);
    expect(success.status).toBe(ResultStatus.Fulfilled);
    expect(() => success.valueUnsafe).toThrowError();
    expect(success.reason).toBeUndefined();
    expect(() => success.enforceValue()).toThrowError();
    expect(() => success.enforceError()).toThrowError();
  });

  test(`creates a failure result`, () => {
    const error = new Error('Intentional error');
    const failure = result(error);
    expect(failure.ok).toBe(false);
    expect(failure.status).toBe(ResultStatus.Rejected);
    expect(failure.value.isNone).toBe(true);
    expect(() => failure.valueUnsafe).toThrowError();
    expect(failure.reason).toBe(error);
    expect(failure.enforceError()).toMatchInlineSnapshot(`[Error: Intentional error]`);
    expect(() => failure.enforceValue()).toThrowError(error);
  });
});

describe('asyncResult', () => {
  test(`resolves to a success result if the promise is resolved`, async () => {
    const testResult = await asyncResult(Promise.resolve('Success!'));
    expect(testResult.ok).toBe(true);
    expect(testResult.valueUnsafe).toBe('Success!');
  });

  test(`resolves to a void success result if the promise resolves to void`, async () => {
    const testResult = await asyncResult(Promise.resolve());
    expect(testResult.ok).toBe(true);
    expect(() => testResult.valueUnsafe).toThrowError();
  });

  test(`resolves to a failure result if the promise is rejected`, async () => {
    const testResult = await asyncResult(Promise.reject(new Error('Intentional error')));
    expect(testResult.ok).toBe(false);
    expect(testResult.reason.message).toBe('Intentional error');
  });

  test(`converts promise errors to Error objects`, async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    const testResult = await asyncResult(Promise.reject('Intentional error'));
    expect(testResult.reason).toBeInstanceOf(Error);
    expect(testResult?.reason?.message).toMatch('Intentional error');
  });
});

describe('Success', () => {
  it('should return a successful result', () => {
    const res = Success(10);

    expect(res.ok).toBe(true);
    expect(res.value.value).toBe(10);
  })
});

describe('Failure', () => {
  it('should return a failure result', () => {
    const res = Failure('test');

    expect(res.ok).toBe(false);
    expect(res.reason.message).toBe('test');
  });
});

describe('Result', () => {
  test(`specifies the result type in its string representation`, () => {
    const success = result('Success!');
    const voidSuccess = result();
    const failure = result(new Error('Intentional error'));
    expect(String(success)).toBe('[object Result: FULFILLED]');
    expect(String(voidSuccess)).toBe('[object Result: FULFILLED]');
    expect(String(failure)).toBe('[object Result: REJECTED]');
  });

  test(`serializes to JSON the same way standard promise results do`, () => {
    const success = result('Success!');
    const voidSuccess = result();
    const failure = result(new Error('Intentional error'));
    expect(JSON.stringify(success)).toBe('{"status":"fulfilled","value":"Success!"}');
    expect(JSON.stringify(voidSuccess)).toBe('{"status":"fulfilled"}');
    expect(JSON.stringify(failure)).toBe('{"status":"rejected","reason":{}}');
  });

  describe('onSuccess', () => {
    it('should execute success handler', () => {
      const success = jest.fn();
      const failure = jest.fn();
      const some = Some(10);

      const sum = some.toResult()
        .onSuccess<number>((num: Maybe<number>) => {
          success(num.value)
          return num.value * 25
        })
        .onFailure<string>(err => failure);

      expect(sum.valueUnsafe).toBe(250);
      expect(success).toHaveBeenCalledTimes(1);
      expect(success).toHaveBeenCalledWith(10);
      expect(failure).toHaveBeenCalledTimes(0);
    });
  });

  describe('onFailure', () => {
    it('should execute failure handler', () => {
      const success = jest.fn();
      const failure = jest.fn();
      const some = None();

      const sum = Failure("Intentional failure")
        .onSuccess<number>(success)
        .onFailure<string>(err => {
          failure()
          return err;
        });

      expect(sum.value.isNone).toBe(true);
      expect(success).toHaveBeenCalledTimes(0);
      expect(failure).toHaveBeenCalledTimes(1);
      expect(sum.reason.message).toBe('Intentional failure')
    });
  });

  describe('wrap', () => {
    it('should execute a function return a successful Result', () => {
      const data = Result.wrap(() => 10 * 20);
      expect(data.ok).toBe(true);
      expect(data.value.isNone).toBe(false);
      expect(data.value.hasValue).toBe(true);
      expect(data.valueUnsafe).toBe(200);
    });

    it('should execute a function return a failed Result', () => {
      const nope = None();
      const data = Result.wrap(() => nope.value);
      expect(data.ok).toBe(false);
      expect(data.value.isNone).toBe(true);
      expect(data.value.hasValue).toBe(false);
      expect(() => data.valueUnsafe).toThrowError();
    });
  });

  describe('wrapAsync', () => {
    it('should execute a function return a successful Result', async () => {
      const data = await Result.wrapAsync(Promise.resolve('Hello'));
      expect(data.ok).toBe(true);
      expect(data.value.isNone).toBe(false);
      expect(data.value.hasValue).toBe(true);
      expect(data.valueUnsafe).toBe('Hello');
    });

    it('should execute a function return a failed Result', async() => {
      const data = await Result.wrapAsync(() => Promise.reject('Intentional Error'));
      
      expect(data.ok).toBe(false);
      expect(data.value.isNone).toBe(true);
      expect(data.value.hasValue).toBe(false);
      expect(() => data.valueUnsafe).toThrowError();
      expect(data.reason.message).toBe('Intentional Error')
    });
  });

  describe('match', () => {
    it('should execute success function for successful Result', () => {
      const success = jest.fn();
      const failed = jest.fn();
      const res = Some(10).toResult();

      res.match(success, failed);

      expect(success).toHaveBeenCalledTimes(1);
      expect(failed).toHaveBeenCalledTimes(0);
    })

    it('should execute failure function for failed result', () => {
      const failed = jest.fn();
      const res = None().toResult();

      expect(res.ok).toBe(false);

      const final = res.match(
        (num: Maybe<number>) => num.value * 2,
        failed
      );

      expect(failed).toHaveBeenCalledTimes(1);
      expect(final.ok).toBe(true);
      expect(final.value.isNone).toBe(true);
    });

    it('should execute the fallback and return successful result with new value', () => {
      const failed = jest.fn();
      const res = None().toResult();

      expect(res.ok).toBe(false);

      const final = res.match(
        (num: Maybe<number>) => num.value * 2,
        _ => {
          failed();
          return 2;
        } 
      );
      
      expect(failed).toHaveBeenCalledTimes(1);
      expect(final.ok).toBe(true);
      expect(final.valueUnsafe).toBe(2);
    })

    it('should return a failed result when matching asuccessful result throws and exception', () => {
        const failed = jest.fn();
        const success = (n: Maybe<number>) => {
          throw new Error('forced exception');
        };

        const res = result(10).match(success, failed);
        expect(res.ok).toBe(false);
        expect(res.reason.message).toBe('forced exception');
        expect(failed).toHaveBeenCalledTimes(0);
    })

    it('should return a failed result when matching a failed result throws and exception', () => {
      const success = jest.fn();
      const failed = _ => {
        throw new Error('forced exception');
      };

      const res = None().toResult().match(success, failed);

      expect(res.ok).toBe(false);
      expect(res.reason.message).toBe('forced exception');
      expect(success).toHaveBeenCalledTimes(0);
    })
  });

  describe('matchAsync', () => {
    it('should execute success function for successful Result', async () => {
      const success = jest.fn();
      const failed = jest.fn();
      const res = Some(10).toResult();

      await res.matchAsync(success, failed);

      expect(success).toHaveBeenCalledTimes(1);
      expect(failed).toHaveBeenCalledTimes(0);
    })

    it('should execute failure function for failed result', async () => {
      const failed = jest.fn();
      const res = None().toResult();

      expect(res.ok).toBe(false);

      const final = await  res.matchAsync(
        (num: Maybe<number>) => Promise.resolve(num.value * 2),
        failed
      );

      expect(failed).toHaveBeenCalledTimes(1);
      expect(final.ok).toBe(true);
      expect(final.value.isNone).toBe(true);
    });

    it('should execute the fallback and return successful result with new value', async () => {
      const failed = jest.fn();
      const res = None().toResult();

      expect(res.ok).toBe(false);

      const final = await res.matchAsync(
        async (num: Maybe<number>) => num.value * 2,
        async _ => {
          failed();
          return 2;
        } 
      );
      
      expect(failed).toHaveBeenCalledTimes(1);
      expect(final.ok).toBe(true);
      expect(final.valueUnsafe).toBe(2);
    })

    it('should return a failed result when matching asuccessful result throws and exception', async () => {
        const failed = jest.fn();
        const success = (n: Maybe<number>) => {
          throw new Error('forced exception');
        };

        const res = await result(10).matchAsync(success, failed);
        expect(res.ok).toBe(false);
        expect(res.reason.message).toBe('forced exception');
        expect(failed).toHaveBeenCalledTimes(0);
    })

    it('should return a failed result when matching a failed result throws and exception', async () => {
      const success = jest.fn();
      const failed = _ => {
        throw new Error('forced exception');
      };

      const res = await None().toResult().matchAsync(success, failed);

      expect(res.ok).toBe(false);
      expect(res.reason.message).toBe('forced exception');
      expect(success).toHaveBeenCalledTimes(0);
    })
  });
});