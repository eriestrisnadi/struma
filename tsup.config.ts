import { umdWrapper } from 'esbuild-plugin-umd-wrapper';
import { defineConfig, Options } from 'tsup';
import { name, dependencies } from './package.json';

const libraryName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

const baseConfig: Options = {
  entry: ['src/index.ts'],
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
  esbuildPlugins: [umdWrapper({ libraryName })],
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
