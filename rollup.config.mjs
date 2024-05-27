import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/index.js', // Your entry point
    output: {
        file: 'dist/bundle.js', // The output file
        format: 'iife', // Immediately-Invoked Function Expression format for browsers
        name: 'CalendarComponent',
        sourcemap: true,
    },
    plugins: [
        resolve(), // Resolves node_modules
        commonjs(), // Converts CommonJS modules to ES6
        terser() // Minifies the bundle
    ]
};
