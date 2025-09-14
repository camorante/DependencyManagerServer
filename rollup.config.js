import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';

export default {
    input: 'src/index.ts',
    output: {
      file: 'dist/bundle.js',
      //dir: 'dist',
      format: 'es'
    },
    plugins: [
        commonjs(),
        json(),
        typescript({
          tsconfig: './tsconfig.json',
          outDir: 'dist', // Debe coincidir con el directorio de salida de Rollup
        }),
        copy({
          targets: [
              { src: '.env.production', dest: 'dist' } // Copia solo .env.production
          ],
          verbose: true // Para ver en consola si el archivo se copió correctamente
        }),
        terser(),
      ],
    external: ['fs', 'path', 'os']
};