var path = require('path');
var ExtractTextPlugin = require('mini-css-extract-plugin');
var TerserPlugin = require('terser-webpack-plugin');
var TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
var webpack = require('webpack');
var project_root = __dirname;
var src_root = path.resolve(project_root, './src');
var demo_root = path.resolve(project_root, './demo');

module.exports = {
    context: project_root,
    mode: 'production',
    entry: {
        antd: ['antd']
    },
    output: {
        path: path.resolve(project_root, './dll'),
        filename: '[name].[hash:8].js',
        library: '[name]_library'
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
            chunkFilename: '[name].[contenthash:8].css'
        }),
        new webpack.DllPlugin({
            path: path.resolve(project_root, 'dll/[name].manifest.json'),
            name: '[name]_library'
        })
    ],
    resolve: {
        modules: [
            path.resolve(project_root, 'node_modules'),
            src_root
        ],
        extensions: ['.ts', '.tsx', '.js', 'jsx', '.scss', '.css', '.html'],
        plugins: [
            new TsConfigPathsPlugin()
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: true
            })
        ]
    }
};