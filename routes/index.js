"use strict";

var express = require('express'),
    router = express.Router();

router.use('/rpc', require('./rpc'));
router.use('/auth', require('./auth'));

module.exports = router;
