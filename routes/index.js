var express = require('express'),
	router = express.Router(),
	passport = require('passport'),
	responseHelper = require('../helper/responseHelper'),
	bookshelfService = require('./../dao/bookshelfService'),
	serviceConfig = require('./../config/serviceConfig'),
	commonUtil = require('./../utils/commonUtil');

var logger = require('log4js').getLogger('routes/index.js');

router.get('/', function(req, res) {
	res.redirect('/home');
});

router.get('/googlea60ae9f984f56832.html', function(req, res) {
	res.render('google');
});

router.get('/home', function(req, res) {
	var result = responseHelper.getDefaultResult(req);

	bookshelfService.getPopularCountries(function(err, countries) {
		if (err) {
			logger.error("can not load popular countries");
			result.countries = serviceConfig.defaultCountires;
			res.render('index', result);
		}

		result.countries = countries;
		res.render('index', result);
	});
});

router.get('/about', function(req,res){
	var result = responseHelper.getDefaultResult(req);
	res.render('about', result);
});

router.get('/notice', function(req,res){
	var result = responseHelper.getDefaultResult(req);
	res.render('notice', result);
});

module.exports = router;
