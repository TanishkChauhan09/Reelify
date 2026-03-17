const express = require('express');
const router = express.Router();
const foodController = require("../controller/food.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const multer = require("multer"); // multer package is used so that express can read the video,audio,pdf that comes from frontend

const upload = multer({
    storage: multer.memoryStorage(),
})


// protected
router.post('/',
     authMiddleware.authFoodPartnerMiddleware ,
     upload.single("video") , // in this string we can only write whatever we have write in the fronted in body when uploading whatever the video,audio,pdf
     foodController.createFood)


router.get('/',
    authMiddleware.authUserMiddleware,
    foodController.getFoodItems
)

router.post('/like',
    authMiddleware.authUserMiddleware,
    foodController.toggleLike
)

router.post('/save',
    authMiddleware.authUserMiddleware,
    foodController.toggleSave
)

router.post('/partner-like',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.partnerLike
)

router.get('/save',
    authMiddleware.authUserMiddleware,
    foodController.getSavedFoods
)

router.get('/:id/comments',
    authMiddleware.authUserMiddleware,
    foodController.getComments
)

router.post('/:id/comments',
    authMiddleware.authUserMiddleware,
    foodController.addComment
)

router.patch('/:id/comments/:commentId',
    authMiddleware.authUserMiddleware,
    foodController.updateComment
)

router.delete('/:id/comments/:commentId',
    authMiddleware.authUserMiddleware,
    foodController.deleteComment
)

router.post('/:id/comments/:commentId/react',
    authMiddleware.authUserMiddleware,
    foodController.toggleCommentReaction
)

router.get('/mine',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.getMyFoods
)

router.delete('/:id',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.deleteFood
)


module.exports = router;
