const path = require('path');
const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            "typeof window": JSON.stringify("object"),
            "window": JSON.stringify(false)
        }),
    ],
    entry: {
        'tester': './src/main.ts'
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
        path: path.resolve(__dirname, 'dist')
    },
    target: "node"
};
