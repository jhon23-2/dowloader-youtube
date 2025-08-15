const express = require('express');
const router = express.Router();
const YoutubeController = require('../controller/youtube-controller')
const { validateParamsMiddleware, validateBodyMiddleware } = require('../middleware/zod-validation')

router.post('/info', validateBodyMiddleware, YoutubeController.getInformation)
router.get('/download', validateParamsMiddleware, YoutubeController.download)

module.exports = router