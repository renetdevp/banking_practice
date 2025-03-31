const router = require('express').Router();

const userController = require('../controllers');

// two middlewares needed, verifyAuth & checkAdmin

router.get('/', userController.readAll);
router.get('/:id', userController.readOne);
router.post('/', userController.createOne);
router.put('/:id', userController.updateOne);
router.delete('/', userController.deleteAll);
router.delete('/:id', userController.deleteOne);

module.exports = router;