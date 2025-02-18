import { Struma } from '../src/Struma';
import { array, defaulted, number, object, string, enums, assign, type Infer, StructError, omit } from 'superstruct';
import { Memory, MemorySync } from '../src/adapters';
import { fromJS, List, Map } from 'immutable';

const Article = object({
  id: number(),
  title: string(),
  tags: array(string()),
  author: object({
    id: number(),
  }),
});

const Theme = object({
  theme: defaulted(enums(['system', 'light', 'dark']), 'system'),
});

const TestSchema = assign(
  object({
    articles: defaulted(array(Article), []),
  }),
  Theme
);

const mockArticle = () => ({
  id: Math.random(),
  title: Math.random().toString(36),
  tags: Array.from({ length: 5 }, () => Math.random().toString(36).slice(3, 10)),
  author: { id: Math.random() },
});

// Mock adapters
const asyncAdapter = new Memory<Infer<typeof TestSchema>>();
const syncAdapter = new MemorySync<Infer<typeof TestSchema>>();

describe('Struma', () => {
  describe('Initialization', () => {
    it('should initialize with Struma instance', () => {
      expect(new Struma(TestSchema, syncAdapter)).toBeInstanceOf(Struma);
    });

    it('should initialize with valid default data', () => {
      // @ts-ignore
      expect(new Struma(omit(TestSchema, ['theme', 'articles']), syncAdapter).state).resolves.toStrictEqual(Map({}));
      // @ts-ignore
      expect(new Struma(omit(TestSchema, ['articles']), syncAdapter).state).resolves.toStrictEqual(
        Map({ theme: 'system' })
      );
      expect(new Struma(TestSchema, syncAdapter).state).resolves.toStrictEqual(
        Map({ articles: List([]), theme: 'system' })
      );
    });

    it('should throw an error if the schema is invalid', () => {
      // @ts-expect-error
      expect(() => new Struma({}, syncAdapter)).toThrow(TypeError('Schema must be instance of Struct.'));
    });

    it('should throw an error if the adapter is invalid', () => {
      // @ts-expect-error
      expect(() => new Struma(TestSchema, {})).toThrow(TypeError('Adapter must have public read & write methods.'));
    });
  });

  describe('State Management', () => {
    it('should update state without writing to the adapter', () => {
      const db = new Struma(TestSchema, syncAdapter);
      const newState = Map({ articles: fromJS(Array.from({ length: 5 }, mockArticle)), theme: 'dark' });

      db.state = newState;

      expect(db.state).resolves.toStrictEqual(newState);
      expect(syncAdapter.read()).toBeNull(); // Adapter not written yet
    });

    it('should validate state against the schema', () => {
      const db = new Struma(TestSchema, syncAdapter);
      const invalidState = { theme: 'dracula', articles: [] }; // Theme has no enum for 'dracula'

      expect(() => {
        db.state = invalidState;
      }).toThrow(StructError);
    });
  });

  describe('Snapshotting', () => {
    it('should take snapshots on state updates', async () => {
      const db = new Struma(TestSchema, syncAdapter);
      const state1 = Map({ articles: fromJS(Array.from({ length: 5 }, mockArticle)), theme: 'dark' });
      const state2 = Map({ articles: fromJS(Array.from({ length: 5 }, mockArticle)), theme: 'system' });

      db.state = state1;
      db.state = state2;

      expect(db.state).resolves.toStrictEqual(state2);
    });
  });

  describe('Write Operations', () => {
    it('should work with async adapters', async () => {
      const db = new Struma(TestSchema, asyncAdapter);
      const newState = Map({ articles: fromJS(Array.from({ length: 5 }, mockArticle)), theme: 'dark' });

      db.state = newState;
      await db.write();

      expect(asyncAdapter.read()).resolves.toStrictEqual(newState.toJS());
    });

    it('should work with sync adapters', async () => {
      const db = new Struma(TestSchema, syncAdapter);
      const newState = Map({ articles: fromJS(Array.from({ length: 5 }, mockArticle)), theme: 'light' });

      db.state = newState;
      await db.write();

      expect(syncAdapter.read()).toStrictEqual(newState.toJS());
    });
  });
});
