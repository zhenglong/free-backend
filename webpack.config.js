var path = require('path');
var ExtractTextPlugin = require('mini-css-extract-plugin');
var TerserPlugin = require('terser-webpack-plugin');
var TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
var project_root = __dirname;
var src_root = path.resolve(project_root, './src');
var demo_root = path.resolve(project_root, './demo');
var lib_root = path.resolve(project_root, './node_modules/');

function vendor(src, symbol) {
    return `${lib_root}/expose-loader?${symbol}!${path.join(lib_root, src)}`;
}

module.exports = {
    mode: 'production',
    entry: {
        'billboard-detail': path.resolve(demo_root, './billboard/detail/app.tsx'),
        'billboard-list': path.resolve(demo_root, './billboard/list/app.tsx'),
        'content-list': path.resolve(demo_root, './content/list/app.tsx'),
        'content-detail': path.resolve(demo_root, './content/detail/app.tsx'),
        'react-rt': [
            vendor('react/cjs/react.production.min.js', 'React'),
            vendor('react-dom/cjs/react-dom.production.min.js', 'ReactDOM'),
            vendor('redux/dist/redux.min.js', 'Redux'),
        ]
    },
    output: {
        path: path.resolve(project_root, './dist'),
        filename: '[name].[hash:8].js'
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/react',
                            '@babel/preset-env'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties'
                        ]
                    }
                },
            },
            {
                test: /\.ts(x?)$/,
                use: {
                    loader: 'ts-loader'
                }
            },
            {
                test: /\.less$/,
                use: [{
                    loader: ExtractTextPlugin.loader
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [require('autoprefixer')]
                    }
                }, {
                    loader: 'less-loader'
                }]
            },
            {
                test: /\.s?css$/,
                use: [{
                    loader: ExtractTextPlugin.loader
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [require('autoprefixer')]
                    }
                }, {
                    loader: 'sass-loader'
                }]
            },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader'
                }]
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 4096
                    }
                },

            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: '[name].[contenthash:8].css',
            chunkFilename: '[id].[contenthash:8].css'
        })
    ],
    resolve: {
        modules: [
            path.resolve(project_root, 'node_modules'),
            src_root
        ],
        extensions: ['.ts', '.tsx', '.js', 'jsx', '.scss', '.css', '.html'],
        plugins: [new TsConfigPathsPlugin()]
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'redux': 'Redux',
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: true
            })
        ]
    }
};