import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/index.js',
  targets: [
    { dest: 'dist/svc-action.js', format: 'umd' },
    { dest: 'dist/svc-action.cjs.js', format: 'cjs' },
    { dest: 'dist/svc-action.es.js', format: 'es' }
  ],
  moduleName: 'svcAction',
  plugins: [
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        [
          'es2015',
          {
            'modules': false
          }
        ]
      ],
      plugins: [
        'external-helpers'
      ]
    }),
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs()
  ]

}
