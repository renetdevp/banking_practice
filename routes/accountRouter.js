const router = require('express').Router();

const accountController = require('../controllers/accountController');
const authMiddleware = require('../middlewares/authMiddleware');

// get all account information, user auth required
router.get('/', authMiddleware.verifyAuth, accountController.readAll);
// get account information, user auth required
router.get('/:accountId', authMiddleware.verifyAuth, accountController.readOne);
// create account, user auth required
router.post('/', authMiddleware.verifyAuth, accountController.createOne);
// delete account, self/admin auth required
router.delete('/:accountId', authMiddleware.verifyAuth, authMiddleware.checkOwnerOrAdmin, accountController.deleteOne);

module.exports = router;