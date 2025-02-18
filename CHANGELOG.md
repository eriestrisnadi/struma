# Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 1.0.0 (2025-02-18)


### Features

- Schema Validation: Ensure data integrity with Superstruct schemas
- Immutable State: Use Immutable to manage state in a predictable way.
- Flexible Adapter: Compatible with lowdb adapters (filesystem, localStorage, memory, etc), or extend functionality with custom adapters for advanced use cases.
- Sync/Async Supports: Supports seamlessly both synchronous and asynchronous adapters.
- Cross-Platform: Works in both Node.js and Browser environments.
- Snapshot History: Automatically takes snapshots of the state, providing historical views of your data.
- Explicit Writes: Mutate state without immediate persistence, and write changes explicitly when needed.
