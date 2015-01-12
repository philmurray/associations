"use strict";

var express = require('express'),
    router = express.Router(),
    passport = require('passport');

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.status(401).send('Not logged in.');
};

router.post('/rpc/localLogin', passport.authenticate('localLogin'), function(req, res){
    res.json(true);
});

/* Handle Logout */
router.get('/rpc/logout', function(req, res) {
    req.logout();
    res.json(true);
});

router.get('/rpc/user', isAuthenticated, function(req, res){
    res.json(res.user);
});

module.exports = router;
