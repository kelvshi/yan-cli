module.exports = {
    main: 'rename',
    rename: {
        // 加前缀
        'prefix': {
            src: './test/files/*.js',
            prefix: 'prefix_'
        },
        // 替换字符串
        'replace': {
            src: './test/files/*.js',
            search: /^(prefix\_)(.*)/g,
            replace: '$2',
        },
        'map': {
            src: './test/files/*',
            async map (filename) {
                return filename.replace(/prefix_/g, '');
            }
        }
    }
}