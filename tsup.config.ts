import { umdWrapper } from 'esbuild-plugin-umd-wrapper';
import { defineConfig, Options } from 'tsup';
import { name, dependencies, peerDependencies } from './package.json';

const baseConfig: Options = {
  entry: ['src/index.ts', 'src/adapters/**/*.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['cjs', 'esm'],
  outDir: 'dist',
  outExtension({ format, options }) {
    const ext = format === 'esm' ? 'mjs' : 'js';
    let extParts: string[] = [];

    if ((format as typeof format | 'umd') === 'umd') {
      extParts.push('umd');
    }

    if (options.minify) {
      extParts.push('min');
    }

    return {
      js: `.${extParts.concat(ext).join('.')}`,
    };
  },
  bundle: true,
};

const umdConfig: Options = {
  ...baseConfig,
  entry: {
    [name]: 'src/umd.ts',
  },
  esbuildPlugins: [
    umdWrapper({
      external: Object.keys(peerDependencies),
      globals: {
        superstruct: 'Superstruct',
        immutable: 'Immutable',
      },
    }),
  ],
  // @ts-ignore
  format: 'umd',
  sourcemap: false,
  noExternal: Object.keys(dependencies),
};

export default defineConfig([
  {
    ...baseConfig,
    dts: true,
  },
  {
    ...umdConfig,
  },
  {
    ...umdConfig,
    minify: true,
  },
]);
