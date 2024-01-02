const Path = require('path')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const rootResolve = pathname => Path.resolve(__dirname, pathname);

const buildFrontend = (_, config) => {
    const isProd = config.mode.startsWith('prod');
    const isDev = !isProd;
    return {
        mode: config.mode,
        target: 'web',
        entry: {
            app: './src/app.tsx',
        },
        output: {
            filename: 'js/[name].js',
            path: Path.resolve(__dirname, 'public/assets')
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: ['ts-loader'],
                },
                {
                    test: /\.s?css$/,
                    exclude: /node_modules/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[name][ext]'
                    }
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            alias: {
                'react': 'preact/compat',
                'react-dom': 'preact/compat',
            },
            "plugins": [
                new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'css/[name].css'
            }),
            new CopyPlugin({
                patterns: [
                    { from: "./src/resources/html", to: Path.resolve(__dirname, "public") },
                ],
            }),
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    //keep_classnames: true,
                    //keep_fnames: true,
                    compress: isProd,
                    format: {
                        comments: false,
                    },
                }
            })
        ],
        optimization: {
            minimize: isProd,
            usedExports: !isProd,
            minimizer: [
                new CssMinimizerPlugin()
            ],
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        chunks: 'all'
                    }
                }
            }
        },
    }
}

module.exports = [
    buildFrontend
]