const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const logger = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const indexRouter = require('./routes/indexRouter');
const connectDB = require('./connect');

app.use(bodyParser.json());
app.use(logger('common'));
app.use(helmet());
app.use(compression());
app.use(rateLimit({
	windowMs: 1000,
	limit: 10,  // threshold: 10 attempt/request in a second
	standardHeaders: 'draft-8',
	legacyHeaders: false,
}));

app.use('/', indexRouter);

connectDB();

app.use((err, req, res, next) => {
    if (!(err?.code && err?.msg)){
        console.error('Server Error', err);

        return res.status(500).json({
            msg: 'Server Error',
        });
    }

    const { code } = err;
    const msg = code<500 ? err.msg : 'Server Error';

    console.error(`Error code: ${code} \n${msg}`);
    res.status(code).json({
        msg: msg,
    });
});

module.exports = app;