var path = require('path');
var webpack = require('webpack');
var TypedocWebpackPlugin = require('typedoc-webpack-plugin');

const plugins = [
  new webpack.LoaderOptionsPlugin({
    minimize: true,
    debug: false
  }),
  new TypedocWebpackPlugin({
    out: '../doc',
    module: 'commonjs',
    target: 'es5',
    exclude: '**/node_modules/**/*.*',
    experimentalDecorators: true,
    excludeExternals: true
  }, './src/main')
]

module.exports = {
    entry: './src/index.ts',

    output: {
        filename: 'novent-engine.js',
        path: path.resolve(__dirname, 'build')
    },

    plugins: plugins,

    resolve: {
        extensions: ['.ts'],
    },

    module: {
        loaders: [
            { test: /\.ts?$/, loader: 'ts-loader', exclude: /node_modules/ }
        ]
    },

    devtool: 'source-map',
}
