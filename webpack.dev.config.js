const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { spawn } = require('child_process');

module.exports = {
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
			},
			{
				test: /\.js?$/,
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
		]
	},
	target: 'electron-renderer',
	plugins: [
		new HtmlWebpackPlugin({ title: 'React Electron App' }),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('development'),
		}),
	],
	externals: {
		'node:fs': 'commonjs2 fs',
		'node:path': 'commonjs2 path',
		'node:process': 'commonjs2 process',
		'node:util': 'commonjs2 util',
		'node:child_process': 'commonjs2 child_process',
		'node:url': 'commonjs2 url',
		'node:os': 'commonjs2 os'
	},
	devtool: 'inline-source-map',
	devServer: {
		contentBase: path.resolve(__dirname, 'dist'),
		stats: {
			colors: true,
			chunks: false,
			children: false,
		},
		before() {
			spawn('electron', ['.'], {
				shell: true,
				env: process.env,
				stdio: 'inherit',
			})
				.on('close', (code) => process.exit(0))
				.on('error', (spawnError) => console.error(spawnError))
		},
	},
}
