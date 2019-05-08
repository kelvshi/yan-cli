const glob = require('glob');
const chalk = require('chalk');
const Promise = require("bluebird");
const fs = require('fs');
const path = require('path');

module.exports = {
    src (globPath) {
        return new Promise ((resolve, reject) => {
            glob(globPath, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
    },
    Promise,
    log (msg, action = 'message', bg = '') {
        if (bg) {
            console.log(chalk.blue(`yan-${action} >> `) + chalk[`bg${bg[0].toUpperCase()}${bg.substr(1)}`].white(msg));
        } else {
            console.log(chalk.blue(`yan-${action} >> `) + chalk.yellow(msg));
        }
    },
    async setLog (filepath, log) {
        let {
            dir
        } = path.parse(filepath);
        await this.noExistsMake(dir);
        fs.writeFileSync(filepath, log);
    },
    error (msg, action = 'error') {
        console.log(chalk.red(`yan-${action} >> `) + chalk.red(msg));
    },
    // 判断文件是否存在
    async isExist (path) {
        const fsStat = Promise.promisify(fs.stat);
        try {
            let result = await fsStat(path);
            return result;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return false;
            } else {
                throw error;
            }
        }
    },
    // 检查目录是否不在，不存在，则创建
    noExistsMake (dir) {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(dir)) {
                resolve();
            } else {
                fs.mkdirSync(dir);
                resolve();
            }
        });
    }
}