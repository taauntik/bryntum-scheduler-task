module.exports = {
    publicPath            : '',
    productionSourceMap   : false,
    transpileDependencies : [
        '@bryntum/scheduler',
        '@bryntum/scheduler-vue'
    ],
    configureWebpack      : {
        performance : {
            hints : false
        }
    }
};
