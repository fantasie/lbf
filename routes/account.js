var express = require('express'),
	router = express.Router(),
	passport = require('passport'),
	serviceConfig = require('./../config/serviceConfig'),
	responseHelper = require('../helper/responseHelper');

var logger = require('log4js').getLogger('account/diary.js');

router.get('/login',
	passport.authenticate('google', { scope: ['openid', 'email'] }));

router.get('/login/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
	function(req, res) {
		loginSuccessHandler(req, res);
	});

router.get('/logout', function(req, res){
	req.logout();
	res.clearCookie('sid');
	res.redirect("/");
});

function loginSuccessHandler(req, res) {
	var successRedirectUrl = "/";

	if (req.cookies.redirectUrl) {
		successRedirectUrl = req.cookies.redirectUrl;
		res.clearCookie("redirectUrl");
	}

	res.redirect(successRedirectUrl);
};

module.exports = router;
