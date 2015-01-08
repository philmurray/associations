"use strict";

var express = require('express'),
    router = express.Router(),
    passport = require('passport');

// As with any middleware it is quintessential to call next()
// if the user is authenticated
var isAuthenticated = function (req, res, next) {
    console.log("authenticating!");
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};

/* GET home page. */
router.get('/', isAuthenticated ,function(req, res) {
    console.log("index page!");
    res.render('index');
});
/* GET login page. */
router.get('/login', function(req, res) {
    if (req.isAuthenticated()){
        res.redirect('/');
        return;
    }
    res.render('login');
});

router.post('/login', passport.authenticate('login'), function(req, res){
    res.json(true);
});

/* Handle Logout */
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

module.exports = router;
