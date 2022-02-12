const presets = [
    ['@babel/env', {
        targets : {
            ie : '11'
        },
        modules     : false,
        corejs      : { version : '3.4', proposals : true },
        useBuiltIns : 'usage'
    }]
];

module.exports = {
    presets,
    plugins : [
        [
            '@babel/plugin-transform-runtime',
            {
                corejs       : false,
                helpers      : true,
                regenerator  : true,
                useESModules : false
            }
        ]
    ]
};
