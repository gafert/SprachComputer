// define child rescript
module.exports = config => {
    config.target = 'electron-renderer';

    /*if (process.env.NODE_ENV === 'production') {
        config.node = {
            __dirname: false,
            __filename: false
        };
    }*/

    config.externals = {
        "serialport": "require('serialport')"
    };

    return config;
};