import { string, object, StructError, type Infer } from 'superstruct';
import { Map } from 'immutable';
import { JSONFileSync } from 'lowdb/node';
import { Struma } from '../src/Struma';
import { join } from 'path';
import { tmpdir } from 'os';
import { unlinkSync } from 'fs';

const TestSchema = object({
  name: string(),
  age: string(),
});

// Temporary file for testing
const tempFilePath = join(tmpdir(), 'test-db.json');

const adapter = new JSONFileSync<Infer<typeof TestSchema>>(tempFilePath);

function cleanUp() {
  try {
    unlinkSync(tempFilePath);
  } catch (e) {}
}

describe('Struma - Node.js', () => {
  beforeAll(() => cleanUp());

  it('should initialize with default data in Node.js', () => {
    const db = new Struma(TestSchema, adapter);
    expect(db.state).resolves.toBeNull();
  });

  it('should update state and write in Node.js', async () => {
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

  it('should handle schema validation errors in Node.js', () => {
    const db = new Struma(TestSchema, adapter);
    const invalidState = Map({ name: 'John', age: 30 });

    expect(() => {
      db.state = invalidState;
    }).toThrow(StructError);
  });
});
