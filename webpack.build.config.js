const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.jsx?$/,
				use: [{ loader: 'babel-loader', options: { compact: false } }],
			},
			{
				test: /\.(jpe?g|png|gif)$/,
				use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }],
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2)$/,
				use: [
					{ loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' },
				],
			},
		],
	},
	externals: {
		'node:fs': 'commonjs2 fs',
		'node:path': 'commonjs2 path',
		'node:process': 'commonjs2 process',
		'node:util': 'commonjs2 util',
		'node:child_process': 'commonjs2 child_process',
		'node:url': 'commonjs2 url',
		'node:os': 'commonjs2 os'
	},
	target: 'electron-renderer',
	plugins: [
		new HtmlWebpackPlugin({ title: 'React Electron App' }),
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename: 'bundle.css',
			chunkFilename: '[id].css',
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
	],
	stats: {
		colors: true,
		children: false,
		chunks: false,
		modules: false,
	},
}
