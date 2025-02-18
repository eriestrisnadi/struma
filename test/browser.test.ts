/**
 * @jest-environment jsdom
 */

import { string, object, type Infer, StructError } from 'superstruct';
import { Map } from 'immutable';
import { LocalStorage } from 'lowdb/browser';
import { Struma } from '../src/Struma';

const TestSchema = object({
  name: string(),
  age: string(),
});

const adapter = new LocalStorage<Infer<typeof TestSchema>>('test-db');

function cleanUp() {
  try {
    localStorage.clear();
  } catch (e) {}
}

describe('Struma - Browser', () => {
  beforeAll(() => cleanUp());

  it('should initialize with default data in Browser', () => {
    const db = new Struma(TestSchema, adapter);
    expect(db.state).resolves.toBeNull();
  });

  it('should update state and write in Browser', async () => {
    const db = new Struma(TestSchema, adapter);
    const state1 = Map({ name: 'John', age: '30' });
    const state2 = Map({ name: 'Jane', age: '28' });

    db.state = state1;
    expect(db.state).resolves.toStrictEqual(state1);
    expect(adapter.read()).toBeNull();
    await db.write();

    db.state = state2;
    expect(db.state).resolves.toStrictEqual(state2);
    expect(adapter.read()).toStrictEqual(state1.toJS());
    await db.write();

    expect(adapter.read()).toStrictEqual(state2.toJS());
  });

  it('should handle schema validation errors in Browser', () => {
    const db = new Struma(TestSchema, adapter);
    const invalidState = Map({ name: 'John', age: 30 });

    expect(() => {
      db.state = invalidState;
    }).toThrow(StructError);
  });
});
