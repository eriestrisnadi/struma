import type { Adapter as AsyncAdapter, SyncAdapter } from 'lowdb';

export * from './node';
export * from './browser';

export interface Adapter<T> {
  read: () => ReturnType<AsyncAdapter<T>['read'] | SyncAdapter<T>['read']>;
  write: (data: T) => ReturnType<AsyncAdapter<T>['write'] | SyncAdapter<T>['write']>;
}

export type { AsyncAdapter, SyncAdapter };
