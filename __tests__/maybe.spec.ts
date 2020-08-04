import { Maybe, Some, None } from '../src/maybe';
import { ResultStatus } from '../src/result';

describe('Maybe', () => {
  it('should create a Maybe with value', () => {
    const val = Maybe('Ashley');
    expect(val.hasValue).toBe(true);
    expect(val.isNone).toBe(false);
    expect(val.hasValue).toBe(true);
    expect(val.value).toBe('Ashley');
  });

  it('should create a Maybe without a value', () => {
    const m = Maybe(null);
    expect(m.hasValue).toBe(false);
    expect(m.isNone).toBe(true);
    expect(m.hasValue).toBe(false);
    expect(m.valueOrDefault(10)).toBe(10);
    expect(() => m.value).toThrow(/Cannot reference value of None./);
  });

  describe('valueOrDefault', () => {
    const val = Some('perhaps');
    const empty = None();

    it('should return the set value and not the default', () => {
      expect(val.valueOrDefault(25)).toBe('perhaps');
    })
    it('should return the default value for a None', () => {
      expect(empty.isNone).toBe(true);
      expect(empty.valueOrDefault(25)).toBe(25);
    })
  });

  describe('map()', () => {
    it('should return a Maybe with a new value', () => {
      const maybe = Maybe(10).map(val => `My test value is: ${val}`);
      expect(maybe.value).toBe('My test value is: 10')
    });

    it('should return a Maybe with a new value', () => {
      const maybe = Maybe(10)
        .map(val => val * 2)
        .map(val => `My test value is: ${val}`);

      expect(maybe.value).toBe('My test value is: 20')
    });
  })
  describe('match()', () => {
    it('should execute success function for Maybe with value', () => {
      const success = jest.fn();
      const failed = jest.fn();
      
      Maybe(10).match(success, failed);

      expect(success).toHaveBeenCalledWith(10);
      expect(failed).toHaveBeenCalledTimes(0);
    });

    it('should execute failuer function for None', () => {
      const success = jest.fn();
      const failed = jest.fn();
      
      Maybe(null).match(success, failed);

      expect(success).toHaveBeenCalledTimes(0);
      expect(failed).toHaveBeenCalledTimes(1);
    });
  })
  describe('toResult()', () => {
    it('should transform Maybe into a successful Result', () => {
      const name = Maybe('Ashley').toResult();
      
      expect(name.ok).toBe(true);
      expect(name.status).toBe(ResultStatus.Fulfilled);
      expect(name.valueUnsafe).toBe('Ashley');
      expect(name.ok).toBe(true);
    });

    it('should transform Maybe into a failed Result', () => {
      const name = Maybe(undefined).toResult();
      
      expect(name.ok).toBe(false);
      expect(name.status).toBe(ResultStatus.Rejected);
      expect(() => name.valueUnsafe).toThrow(/Cannot reference value of None./);
      expect(name.ok).toBe(false);
    });
  })
});

describe('Some', () => {
  it('should execute success function on match(success, failure)', () => {
    const success = jest.fn();
    const failed = jest.fn();
    
    Some(10).match(success, failed);

    expect(success).toHaveBeenCalledWith(10);
    expect(failed).toHaveBeenCalledTimes(0);
  });

  it('should execute failure function on match(success, failure)', () => {
    const success = jest.fn();
    const failed = jest.fn();
    
    Some(null).match(success, failed);

    expect(success).toHaveBeenCalledTimes(0);
    expect(failed).toHaveBeenCalledTimes(1);
  });

  it('should transform into a success Result', () => {
    const m = Some('Ashley');
    const name = m.toResult();

    expect(name.ok).toBe(true);
    expect(name.status).toBe(ResultStatus.Fulfilled);
    expect(name.valueUnsafe).toBe('Ashley');
    expect(name.ok).toBe(true);
  });

  it('should transform into a failed Result', () => {
    const name = Some(null).toResult();

    expect(name.ok).toBe(false);
    expect(name.status).toBe(ResultStatus.Rejected);
    expect(() => name.valueUnsafe).toThrow(/Cannot reference value of None./);
    expect(name.ok).toBe(false);
  });
})
describe('None', () => {
  it('should create a Maybe with ', () => {
    const m = None();
    expect(m.hasValue).toBe(false);
    expect(m.isNone).toBe(true);
    expect(m.hasValue).toBe(false);
    expect(() => m.value).toThrow(/Cannot reference value of None./);
  });

  it('should execute failure function on match(success, failure)', () => {
    const success = jest.fn();
    const failed = jest.fn();
    
    None().match(success, failed);

    expect(success).toHaveBeenCalledTimes(0);
    expect(failed).toHaveBeenCalledTimes(1);
  });

  it('should transform into a failed Result', () => {
    const name = None().toResult();
    expect(name.ok).toBe(false);
    expect(name.status).toBe(ResultStatus.Rejected);
    expect(() => name.valueUnsafe).toThrow(/Cannot reference value of None./);
    expect(name.ok).toBe(false);
  });
})