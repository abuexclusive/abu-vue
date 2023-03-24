import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';


export default {
  input: './src/index.js',
  output: {
    file: 'dist/vue.js',
    format: 'umd',  // umd 在Window上会全局挂载{name} Vue 
    name: 'Vue',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    serve({
      port: 3000,
      contentBase: '',
      openPage: '/index.html',
    })
  ]
}