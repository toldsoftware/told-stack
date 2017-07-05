import * as webpack from 'webpack';
import { generateEntry } from "./config/generate-entry.webpack.config";

// Use Nodemon to monitor this for changes
// See package.json
// npm start 
// https://github.com/webpack/webpack-dev-server/issues/440
const entry = generateEntry(__dirname);

const config: webpack.Configuration = {
    // entry: {
    //     '../_deploy/lookup-lsc-01-http/bundle.js': `${__dirname}/src/_endpoints/lookup-lsc-01-http.ts`,
    //     '../_deploy/lookup-lsc-02-update-request-queue/bundle.js': `${__dirname}/src/_endpoints/lookup-lsc-02-update-request-queue.ts`,
    //     '../_deploy/lookup-lsc-03-update-execute-queue/bundle.js': `${__dirname}/src/_endpoints/lookup-lsc-03-update-execute-queue.ts`,
    // },
    entry,
    output: {
        path: `${__dirname}/`,
        filename: '[name]',
        // No Sourcemap
        sourceMapFilename: ''
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin()
    ],
    target: 'node',
    node: {
        __filename: false,
        __dirname: false,
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
        ]
    },
};

export default config;
