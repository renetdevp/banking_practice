const router = require('express').Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware.verifyAuth, authMiddleware.checkAdmin, userController.readAll);
router.get('/:id', authMiddleware.verifyAuth, authMiddleware.checkSelfOrAdmin, userController.readOne);
router.post('/', userController.createOne);
router.put('/:id', authMiddleware.verifyAuth, authMiddleware.checkSelfOrAdmin, userController.updateOne);
router.delete('/', authMiddleware.verifyAuth, authMiddleware.checkAdmin, userController.deleteAll);
router.delete('/:id', authMiddleware.verifyAuth, authMiddleware.checkSelfOrAdmin, userController.deleteOne);

module.exports = router;