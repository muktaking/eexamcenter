//routing dashboard
const express = require('express');
const router = express.Router();

const dbController = require('./dbController'); 

router.get('/', dbController.dBoardController);

module.exports = router;