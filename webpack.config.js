module.exports = {
    context: __dirname + '/app/scripts.babel/',
    entry: {
        background: './background.js',
        chromereload: './chromereload.js',
        popup: './popup.js',
    },
    output: { filename: '[name].js' },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader'
        }, {
            test: /\.vue$/,
            loader: 'vue-loader'
        }]
    }
}
