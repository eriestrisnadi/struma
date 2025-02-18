import { Struma } from './Struma';

import { Memory, MemorySync } from './adapters';
import * as browser from './adapters/browser';

// @ts-ignore
Struma.adapters = Object.assign({ Memory, MemorySync }, browser);

export { Struma };
