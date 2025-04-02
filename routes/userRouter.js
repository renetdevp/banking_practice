const router = require('express').Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// two middlewares needed, verifyAuth & checkAdmin

router.get('/', authMiddleware.verifyAuth, authMiddleware.checkAdmin, userController.readAll);
router.get('/:id', authMiddleware.verifyAuth, userController.readOne);
router.post('/', userController.createOne);
router.put('/:id', authMiddleware.verifyAuth, userController.updateOne);
router.delete('/', authMiddleware.verifyAuth, authMiddleware.checkAdmin, userController.deleteAll);
router.delete('/:id', authMiddleware.verifyAuth, userController.deleteOne);

module.exports = router;