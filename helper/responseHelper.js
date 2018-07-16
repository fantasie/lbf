var serviceConfig = require('./../config/serviceConfig');

var logger = require('log4js').getLogger('responseHelper');

function setRedirectUrl(req, res) {
	var path = req.body.path;
	if (!path) {
		path = req.originalPath;
	}

	if (!path) {
		path = req.originalUrl;
	}

	if (!path) {
		logger.warn("can not set cookie. ");
		return;
	}

	return res.cookie('redirectUrl', path, { maxAge: 300000, httpOnly: true });
};

exports.setRedirectUrl = setRedirectUrl;
exports.checkLoginWithRedirect = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	setRedirectUrl(req, res);
	return res.redirect('/account/login');
};

exports.checkLoginWithResult = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	var result = getDefaultResult(req);
	result.errorType = "login";
	result.errorMessage = "You need login.";
	setRedirectUrl(req, res);

	return res.json(result);
};

var getDefaultResult = function(req){
	var result = {
		'siteConfig': serviceConfig.site
	};

	if (req.user && req.user.user_id) {
		result.user = {
			user_id: req.user.user_id,
			name: req.user.name,
			email: req.user.email,
			image: req.user.image,
			point: req.user.point,

		}
	}

	return result;
};

exports.getDefaultResult = getDefaultResult;