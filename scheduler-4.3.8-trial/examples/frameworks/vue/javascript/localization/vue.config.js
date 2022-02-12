module.exports = {
    publicPath            : '',
    productionSourceMap   : false,
    transpileDependencies : [
        'bryntum-scheduler'
    ],
    configureWebpack      : {
        performance : {
            hints : false
        }
    }
};
