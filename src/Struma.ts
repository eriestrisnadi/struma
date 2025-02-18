import { create, Struct, type Infer } from 'superstruct';
import { fromJS, List, isImmutable } from 'immutable';
import { Low, LowSync } from 'lowdb';
import type { Adapter, AsyncAdapter } from './adapters';

export class Struma<Schema extends Struct<any, any>> {
  #schema: Schema;
  #adapter: Adapter<Infer<Schema>>;
  #db: Low<Infer<Schema>> | LowSync<Infer<Schema>>;
  #snapshots: List<Infer<Schema> | null> = List();
  #promises: Promise<Infer<Schema> | null>[] = [];

  constructor(schema: Schema, adapter: Adapter<Infer<Schema>>) {
    if (!(schema instanceof Struct)) {
      throw new TypeError('Schema must be instance of Struct.');
    }
    if (!('read' in adapter && 'write' in adapter)) {
      throw new TypeError('Adapter must have public read & write methods.');
    }

    this.#schema = schema;
    this.#adapter = adapter;

    if (this.#isAsync(this.#adapter)) {
      this.#db = new Low(this.#adapter, this.#defaultData);
    } else {
      this.#db = new LowSync(this.#adapter, this.#defaultData);
    }

    this.#snapshots = this.#snapshots.push(fromJS(this.#defaultData));
    this.#promises.push(Promise.resolve(this.#db.read()));
  }

  get #defaultData() {
    try {
      return create({}, this.#schema);
    } catch (_) {
      return null;
    }
  }

  #snapshot() {
    const latest = fromJS(this.#db.data);
    this.#snapshots = this.#snapshots.push(latest);
  }

  #isAsync(adapter: Adapter<Infer<Schema>>): adapter is AsyncAdapter<Infer<Schema>> {
    return adapter?.read instanceof Promise;
  }

  set state(value: any | undefined) {
    const nextValue = isImmutable(value) ? value.toJS() : value;
    this.#db.data = create(nextValue, this.#schema);
    this.#snapshot();
  }

  get state() {
    return (async () => {
      await Promise.all(this.#promises);

      return this.#snapshots.last();
    })();
  }

  get snapshots() {
    return (async () => {
      await Promise.all(this.#promises);

      return this.#snapshots;
    })();
  }

  public async write(): Promise<void> {
    await Promise.all(this.#promises);
    await Promise.resolve(this.#db.write());

    this.#promises = [];
  }
}
