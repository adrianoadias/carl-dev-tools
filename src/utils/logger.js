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
        if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
            console.log(chalk.gray('🐛'), message);
        }
    }

    static step(step, total, message) {
        const progress = chalk.cyan(`[${step}/${total}]`);
        console.log(progress, message);
    }

    static header(title) {
        console.log('\n' + chalk.bold.cyan(title));
        console.log(chalk.cyan('─'.repeat(title.length)));
    }
}
