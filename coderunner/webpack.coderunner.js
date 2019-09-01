const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            "typeof window": JSON.stringify("object"),
            "window": JSON.stringify(false)
        }),
        new CopyPlugin([
            { from: path.resolve(__dirname, 'Dockerfile'), to: path.resolve(__dirname, '..', 'dist', 'coderunner') }
        ]),
    ],
    entry: {
        'code': './src/code.ts'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '..', 'dist', 'coderunner', 'dist')
    },
    target: "node"
};
