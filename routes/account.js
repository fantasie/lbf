var express = require('express'),
	router = express.Router(),
	passport = require('passport'),
	serviceConfig = require('./../config/serviceConfig'),
	responseHelper = require('../helper/responseHelper'),
	commonUtil = require('./../utils/commonUtil'),
	bookshelfService = require('./../helper/bookshelfService'),
	async = require('async');

var logger = require('log4js').getLogger('account/diary.js');

function hasExtraInfo(user) {
	if (user.country_code && user.name && user.name != "") {
		return true;
	}

	return false;
};

router.get('/login',
	passport.authenticate('google', { scope: ['openid', 'email'] }));

router.get('/login/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
	function(req, res) {
		if (!req.session.passport.user) {
			logger.warn("passport user info does not exists.");
			return loginSuccessHandler(req, res);
		}

		if (!hasExtraInfo(req.session.passport.user)) {
			return res.redirect('/account/config');
		}

		loginSuccessHandler(req, res);
	});

router.get('/config', responseHelper.checkLoginWithRedirect, function(req, res){
	var result = responseHelper.getDefaultResult(req);
	result.user_name = (req.user && req.user.name) ? req.user.name : "";

	var country = "";
	if (req.user && req.user.country_code) {
		var countryObj = commonUtil.getCountry(req.user.country_code);
		if (countryObj) {
			country = countryObj.countryName;
		}
	}

	result.country = country;
	return res.render('config', result);
});

router.post('/save', responseHelper.checkLoginWithResult, function(req, res) {
	var result = responseHelper.getDefaultResult(req);

	var countryName = req.body.country,
		countryCode = countryName && commonUtil.getCountryCode(countryName),
		continent = countryCode && commonUtil.getCountry(countryCode).continent;
	if (!countryName || !countryCode || !continent) {
		logger.warn("failed to parse country: " + countryName + ", " + countryCode + ", " + continent);

		result.errorType = "input";
		result.errorElement = "country";
		result.errorMessage = "Entered country is invalid.";
		return res.json(result);
	}

	var name = req.body.name;
	if (!name || !/^[a-zA-Z0-9.\-_$@*! ]{1,20}$/.test(name)) {
		result.errorType = "input";
		result.errorElement = "name";
		result.errorMessage = "Entered nickname is invalid.";
		return res.json(result);
	}

	async.waterfall([
		function(callback) {
			bookshelfService.fillUserConfig(req.user.user_id, name, countryCode, callback);
		}
	], function (err, data) {
		if (err || !data) {
			logger.warn("failed to save: " + err);
			result.errorType = "insert";
			result.errorMessage = "Failed to save data.";
			return res.json(result);
		}

		req.user.country_code = countryCode;
		req.user.name = name;

		var successRedirectUrl = "/";
		if (req.cookies.redirectUrl) {
			successRedirectUrl = req.cookies.redirectUrl;
			res.clearCookie("redirectUrl");
		}
		result.redirectUrl = successRedirectUrl;
		return res.json(result);
	});
});

router.get('/logout', function(req, res){
	req.session.destroy();
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
