const glob = require('glob');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const utils = require('./utils.js');
const rename = utils.Promise.promisify(fs.rename);

module.exports = async function (options) {
    let {
        prefix = '',
        src,
        search,
        replace,
        map
    } = options;
    try {
        let files = await utils.src(src);
        let promises = [];
        if (search) {
            // search 转化为正则
            search = eval(search);
        }
        files.forEach(async file => {
            let info = path.parse(file);
            // 先获取newName
            const getNewName = async () => {
                let name;
                // 如果有map,则使用map
                if (map) {
                    name = await map(info.base);
                    if (!name) {
                        throw new Error('map must return a new path');
                    }
                } else {
                    name = `${prefix}${info.base}`;
                    name = name.replace(search, replace);
                }
                return name;
            };
            promises.push((async () => {
                let newName = await getNewName();
                let newPath = path.join(info.dir, newName);
                let result = await rename(file, newPath);
                utils.log(`${file} => ${newName}`, 'rename');
            })());
        });
        return await Promise.all(promises);
    } catch (err) {
        utils.error(err);
    }
}