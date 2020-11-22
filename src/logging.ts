import { configure } from 'log4js';

configure({
    appenders: { default: { type: 'console' } },
    categories: {
        default: { appenders: ['default'], level: process.env.LOG_LEVEL || 'info' },
    },
});
