const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const HttpsProxyAgent = require('https-proxy-agent');
const SocksProxyAgent = require('socks-proxy-agent');
const utils = require('./utils.js');

// 获取一张图片
const fetchOne = async (options) => {
    let {
        url, // url
        filename, // 保存路径
        proxy
    } = options;

    utils.log(`开始获取 ${url}`, '#00f');
    let fetchOpts = {};

    // 代理
    if (proxy) {
        let proxyUrl = 'http://127.0.0.1:1087';
        if (typeof proxy === 'string') {
            proxyUrl = proxy;
        }
        if (proxyUrl.indexOf('http') === 0) {
            fetchOpts['agent'] = new HttpsProxyAgent(proxyUrl);
        } else if (proxyUrl.indexOf('socks') === 0) {
            fetchOpts['agent'] = new SocksProxyAgent(proxyUrl);
        }
    }

    // 如果目录是函数，取返回值
    let filePath = '';
    if (typeof filename === 'function') {
        filePath = filename(url);
    } else {
        filePath = filename;
    }

    let { dir } = path.parse(filePath);

    // 先判断目录是否存在
    await utils.noExistsMake(path.resolve(dir));

    let res = await fetch(url, fetchOpts);

    return new Promise((resolve, reject) => {
        const dest = fs.createWriteStream(filePath);
        res.body.pipe(dest);
        dest.on('finish', () => {
            resolve({
                url,
                filename: filePath
            });
            utils.log(`获取成功 ${url}`, '#0f0');
        });
        dest.on('error', (error) => {
            utils.error(`获取失败 ${url}`);
            reject(error);
        });
    });
};

// 批量获取
const fetchBatch = async (options) => {
    // 生成任务
    let promises = [];
    let failTask = [];
    for (let i = 0; i < options.list.length; i++) {
        let task = options.list[i];
        let ops = Object.assign({}, options, task);
        let promise = fetchOne(ops).catch(e => {
            failTask.push(ops);
        });
        promises.push(promise);
    }

    return Promise.all(promises).then(() => {
        if (options.failLog && failTask.length) {
            utils.setLog(options.failLog, JSON.stringify(failTask));
        }
    });
};

module.exports = async function (options) {
    let {
        list
    } = options;
    if (list && list.length) {
        fetchBatch(options);
    } else {
        fetchOne(options);
    }
};
