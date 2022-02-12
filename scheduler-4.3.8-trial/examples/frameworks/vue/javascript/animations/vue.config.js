module.exports = {
    lintOnSave            : false,
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
