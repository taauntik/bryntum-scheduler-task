module.exports = {
    publicPath            : '',
    productionSourceMap   : false,
    transpileDependencies : [
        '@bryntum/scheduler',
        '@bryntum/scheduler-vue',
        'vuetify'
    ],
    configureWebpack      : {
        performance : {
            hints : false
        }
    }
};
