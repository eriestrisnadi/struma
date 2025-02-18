# Struma

[![npm package](https://img.shields.io/badge/npm-struma-brightgreen)](https://www.npmjs.com/package/struma)
[![version number](https://img.shields.io/npm/v/struma?color=green&label=version)](https://github.com/eriestrisnadi/struma/releases)
[![Release & Publish](https://github.com/eriestrisnadi/struma/actions/workflows/release.yml/badge.svg)](https://github.com/eriestrisnadi/struma/actions/workflows/release.yml)
[![License](https://img.shields.io/github/license/eriestrisnadi/struma)](https://github.com/eriestrisnadi/struma/blob/main/LICENSE)

A schema-driven JSON Database with immutable snapshots capabilities. Built on top of [Immutable](https://github.com/facebook/immutable-js), [Superstruct](https://github.com/ianstormtaylor/superstruct) and [lowdb](https://github.com/typicode/lowdb).

## Features

- **Schema Validation**: Ensure data integrity with `Superstruct` schemas
- **Immutable State**: Use `Immutable` to manage state in a predictable way.
- **Flexible Adapter**: Compatible with `lowdb` adapters (filesystem, localStorage, memory, etc), or extend functionality with custom adapters for advanced use cases.
- **Sync/Async Supports**: Supports seamlessly both synchronous and asynchronous adapters.
- **Cross-Platform**: Works in both Node.js and Browser environments.
- **Snapshot History**: Automatically takes snapshots of the state, providing historical views of your data.
- **Explicit Writes**: Mutate state without immediate persistence, and write changes explicitly when needed.

## Installation

Install the library using npm:

```sh
npm install immutable superstruct struma --save
```

Or with yarn:

```sh
yarn add immutable superstruct struma
```

## Usage

### 1. Define a Schema

Use `superstruct` to define a schema for your data:

```ts
import { number, object, string } from 'superstruct';

const UserSchema = object({
  name: string(),
  age: number(),
  preferences: object({
    theme: string(),
  }),
});
```

### 2. Initialize Struma

```ts
import { Struma } from 'struma';
import { JSONFile } from 'struma/adapters/node';

const adapter = new JSONFile('db.json');
const db = new Struma(UserSchema, adapter);
```

### 3. Update and Save State

```ts
import { Map } from 'immutable';

// Update state
const newState = Map({
  name: 'Alice',
  age: 30,
  preferences: Map({
    theme: 'dark',
  }),
});
// Either you can use plain js object too, it will
// auto resolves using `fromJS` method from `immutable`
db.state = newState;

// Save state to write into db.json
await db.write();
```

```ts
// db.json
{
  "name": "Alice",
  "age": 30,
  "preferences": {
    "theme": "dark"
  }
}
```

### 4. Read State

```ts
console.log((await db.state).toJS()); // { name: 'Alice', age: 30, preferences: { theme: 'dark'} }
```

### 5. Access Snapshot History

```ts
console.log((await db.snapshots).toJS()); // Array of historical states
```

## API

### `new Struma(schema, adapter)`

Creates a new `Struma` instance.

- `schema`: A `superstruct` schema for data validation.
- `adapter`: An adapter that conforms to the `Adapter` interface.

### `db.state`

- **Getter**: Returns the current state as an immutable object.
- **Setter**: Updates the state. Throws an error if the data is invalid.

### `db.write()`

Write the current state to the adapter. Returns a promise that resolves when the write operation is complete.

### `db.snapshots`

Returns a Promise that resolves a list of historical states (snapshots) as an immutable List. Each snapshot is an immutable representation of the state at a specific point in time.

### Custom Adapters

You can create your own adapter as long as it conforms to the `Adapter` interface

```ts
import type { Adapter as AsyncAdapter, SyncAdapter } from 'lowdb';

export interface Adapter<T> {
  read: () => ReturnType<AsyncAdapter<T>['read'] | SyncAdapter<T>['read']>;
  write: (data: T) => ReturnType<AsyncAdapter<T>['write'] | SyncAdapter<T>['write']>;
}
```

> [!TIP]
> For common case, you can go to `lowdb` [Documentation](https://github.com/typicode/lowdb/blob/main/README.md#third-party-adapters)

## Examples

### Node.js / ES Modules

```es6
import { Struma } from 'struma';
import { JSONFile } from 'struma/adapters/node';
import { number, object, string } from 'superstruct';

const UserSchema = object({
  name: string(),
  age: number(),
});

const adapter = new JSONFile('db.json');
const db = new Struma(UserSchema, adapter);

(async () => {
  // Update state
  db.state = { name: 'Alice', age: 25 };

  // Save state
  await db.write();

  // Read state
  console.log((await db.state).toJS()); // { name: 'Alice', age: 25 }

  // Access snapshot history
  console.log((await db.snapshots).toJS()); // [null, { name: 'Alice', age: 25 }]
})();
```

### UMD

As for UMD build, it will exposes `Struma` class,
and `Struma.adapters` compatible adapters for browser as global.

```html
<script src="https://unpkg.com/immutable"></script>
<script src="https://unpkg.com/superstruct"></script>
<script src="https://unpkg.com/struma"></script>
<script>
  // Define a schema
  const UserSchema = Superstruct.object({
    name: Superstruct.string(),
    age: Superstruct.string(),
  });

  const adapter = new Struma.adapters.LocalStorage('db');
  const db = new Struma(UserSchema, adapter);

  (async () => {
    // Update state
    const newState = { name: 'John', age: '30' };
    db.state = newState;

    // Save state to write into LocalStorage
    await db.write();

    // Read state
    const state = await db.state;
    console.log('Current State:', state.toJS()); // { name: 'John', age: '30' }

    // Access snapshot history
    const snapshots = await db.snapshots;
    console.log('Snapshot History:', snapshots.toJS()); // [null, { name: 'John', age: '30' }]
  })();
</script>
```

## Support

For feedbacks or issues, check out the [Issues](https://github.com/eriestrisnadi/struma/issues).
