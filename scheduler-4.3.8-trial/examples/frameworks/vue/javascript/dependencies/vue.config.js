module.exports = {
    publicPath            : '',
    outputDir             : undefined,
    assetsDir             : undefined,
    runtimeCompiler       : undefined,
    productionSourceMap   : false,
    parallel              : undefined,
    css                   : undefined,
    transpileDependencies : [
        '@bryntum/scheduler'
    ],
    configureWebpack      : {
        performance : {
            hints : false
        }
    }
};
