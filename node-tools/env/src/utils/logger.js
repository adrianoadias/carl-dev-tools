import chalk from 'chalk';

export class Logger {
    static info(message) {
        console.log(chalk.blue('ℹ'), message);
    }

    static success(message) {
        console.log(chalk.green('✓'), message);
    }

    static warning(message) {
        console.log(chalk.yellow('⚠'), message);
    }

    static error(message) {
        console.log(chalk.red('✗'), message);
    }

    static debug(message) {
        if (process.env.DEBUG) {
            console.log(chalk.gray('🐛'), message);
        }
    }
}
