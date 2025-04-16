const router = require('express').Router();

const userRouter = require('./userRouter');
const accountRouter = require('./accountRouter');
const transactionRouter = require('./transactionRouter');
const authRouter = require('./authRouter');

router.use('/users', userRouter);
router.use('/accounts', accountRouter);
router.use('/transactions', transactionRouter);
router.use('/auth', authRouter);

module.exports = router;