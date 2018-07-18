var express = require('express'),
	router = express.Router(),
	responseHelper = require('../helper/responseHelper'),
	bookshelfService = require('./../helper/bookshelfService'),
	mysqlService = require('./../helper/mysqlService'),
	serviceConfig = require('./../config/serviceConfig'),
	async = require('async'),
	commonUtil = require('./../utils/commonUtil');

// var ocr = require('./../utils/ocr');
// const multer = require('multer');

var logger = require('log4js').getLogger('routes/code.js');

router.get('/register', responseHelper.checkLoginWithRedirect, function(req, res) {
	var result = responseHelper.getDefaultResult(req);

	var country = "";
	if (req.user.country_code) {
		var countryObj = commonUtil.getCountry(req.user.country_code);
		if (countryObj) {
			country = countryObj.countryName;
		}
	}

	result.country = country;
	res.render('register', result);
});

router.post('/register', responseHelper.checkLoginWithResult, function(req, res){
	var result = responseHelper.getDefaultResult(req),
		trainerCode = req.body.trainer_code && req.body.trainer_code.replace(/\s/g, ''),
		trainerName = req.body.trainer_name && req.body.trainer_name.trim(),
		countryName = req.body.country,
		comment = req.body.comment;

	var countryCode = countryName && commonUtil.getCountryCode(countryName),
		continent = countryCode && commonUtil.getCountry(countryCode).continent;
	if (!countryName || !countryCode || !continent) {
		logger.warn("failed to parse country: " + countryName + ", " + countryCode + ", " + continent);

		result.errorType = "input";
		result.errorElement = "country";
		result.errorMessage = "Entered country is invalid.";
		return res.json(result);
	}

	if (!trainerName || !/^[A-Za-z0-9]{3,16}$/.test(trainerName)) {
		result.errorType = "input";
		result.errorElement = "trainer_name";
		result.errorMessage = "Entered trainer name is invalid.";
		return res.json(result);
	}

	if (!trainerCode || !/^\d{12}$/.test(trainerCode)) {
		result.errorType = "input";
		result.errorElement = "trainer_code";
		result.errorMessage = "Entered trainer code is invalid.";
		return res.json(result);
	}

	var data = {
		trainerCode: trainerCode,
		trainerName: trainerName,
		countryCode: countryCode,
		continent: continent
	};

	if (comment) {
		data.comment = comment.substring(0, 1000);
	}

	async.waterfall([
		function(callback) {
			bookshelfService.insertCode(req.user, data, callback);
		},
		function(data, callback) {
			bookshelfService.adjustCountryCount(countryCode, 1, function(err) {
				if (err) {
					logger.error("can not increase country count. country: " + countryCode);
				}
				callback(null, data);
			});
		}
	], function (err, data) {
		if (err) {
			logger.warn("failed to insert: " + err);
			result.errorType = "insert";
			result.errorMessage = "Failed to insert data.";
			return res.json(result);
		}

		result.codeId = data.id;
		return res.json(result);
	});
});

router.get('/update/:id', responseHelper.checkLoginWithRedirect, function(req, res) {
	var result = responseHelper.getDefaultResult(req);

	var id = req.params.id;
	if (!id) {
		result.errorType = "request";
		result.errorMessage = "Invalid request parameter.";
		return res.render('update', result);
	}

	bookshelfService.getMyCode(req.user.user_id, id, function(err, code){
		if (err || !code) {
			result.errorType = "request";
			result.errorMessage = "Invalid request parameter.";
			return res.render('update', result);
		}

		result.code = code;
		result.code.trainer_code = formatizeTrainerCode(result.code.trainer_code);
		result.code.country = commonUtil.getCountry(result.code.country_code).countryName;

		return res.render('update', result);
	});
});

router.post('/update', responseHelper.checkLoginWithResult, function(req, res){
	bookshelfService.getMyCode(req.user.user_id, req.body.code_id, function(err, originalCode) {
		if (err || !originalCode) {
			var result = responseHelper.getDefaultResult(req);
			result.errorType = "request";
			result.errorMessage = "Invalid request parameter.";
			return res.json(result);
		}

		process(req, originalCode);
	});

	var process = function(req, originalCode) {
		var result = responseHelper.getDefaultResult(req),
			originCountryCode = originalCode.country_code,
			trainerCode = req.body.trainer_code && req.body.trainer_code.replace(/\s/g, ''),
			trainerName = req.body.trainer_name && req.body.trainer_name.trim(),
			countryName = req.body.country,
			comment = req.body.comment,
			userImage = req.body.user_image && req.body.user_image.trim();

		var countryCode = countryName && commonUtil.getCountryCode(countryName),
			continent = countryCode && commonUtil.getCountry(countryCode).continent;
		if (!countryName || !countryCode || !continent) {
			logger.warn("failed to parse country: " + countryName + ", " + countryCode + ", " + continent);

			result.errorType = "input";
			result.errorElement = "country";
			result.errorMessage = "Entered country is invalid.";
			return res.json(result);
		}

		if (!trainerName || !/^[A-Za-z0-9]{3,16}$/.test(trainerName)) {
			result.errorType = "input";
			result.errorElement = "trainer_name";
			result.errorMessage = "Entered trainer name is invalid.";
			return res.json(result);
		}

		if (!trainerCode || !/^\d{12}$/.test(trainerCode)) {
			result.errorType = "input";
			result.errorElement = "trainer_code";
			result.errorMessage = "Entered trainer code is invalid.";
			return res.json(result);
		}

		var data = {
			id: originalCode.id,
			trainerCode: trainerCode,
			trainerName: trainerName,
			countryCode: countryCode,
			continent: continent,
			userImage: userImage
		};

		if (comment) {
			data.comment = comment.substring(0, 1000);
		}

		async.waterfall([
			function(callback) {
				bookshelfService.updateCode(req.user, data, callback);
			},
			function(data, callback) {
				if (!data) {
					result.errorType = "insert";
					result.errorMessage = "Failed to save data.";
					return res.json(result);
				}

				if (originCountryCode == countryCode) {
					return callback(null, null);
				}

				bookshelfService.adjustCountryCount(originCountryCode, -1, function(err) {
					if (err) {
						logger.error("can not decrease country count. country: " + originCountryCode);
					}
					callback(null, data);
				});
			},
			function(data, callback) {
				if (originCountryCode == countryCode) {
					return callback(null, null);
				}

				bookshelfService.adjustCountryCount(countryCode, 1, function(err) {
					if (err) {
						logger.error("can not increase country count. country: " + countryCode);
					}
					callback(null, data);
				});
			}
		], function (err, data) {
			if (err) {
				logger.warn("failed to save: " + err);
				result.errorType = "insert";
				result.errorMessage = "Failed to save data.";
				return res.json(result);
			}

			return res.json(result);
		});
	};
});

router.get('/view', responseHelper.checkLoginWithRedirect, function(req, res){
	async.waterfall([
		function(callback) {
			mysqlService.getRandomCode({
				userId: req.user.user_id,
				continent: req.query.continent,
				countryCode: req.query.country_code
			}, callback);
		},
		function(data, callback) {
			if (!data) {
				var result = responseHelper.getDefaultResult(req);
				result.errorType = "empty";
				result.errorMessage = "Trainer data does not exist in the country you selected. Please try other countries!.";
				return res.render('view', result);
			}

			bookshelfService.adjustCode(data.id, 'view', 1, function() {
				callback(null, data);
			});
		}
	], function (err, data) {
		var result = responseHelper.getDefaultResult(req);
		if (err) {
			result.errorType = "request";
			result.errorMessage = "Invalid request parameter.";
			return res.render('view', result);
		}

		result.code = data;
		result.code.view = result.code.view + 1;
		result.code.trainer_code = formatizeTrainerCode(result.code.trainer_code);
		result.code.country_name = commonUtil.getCountry(result.code.country_code).countryName;
		result.code.user_image = (result.code.user_image) ? result.code.user_image : serviceConfig.defaultUserImage;

		return res.render('view', result);
	});
});

router.get('/view/:id', function(req, res){
	var id = req.params.id;
	async.waterfall([
		function(callback) {
			bookshelfService.getCode(id, callback);
		},
		function(data, callback) {
			if (!data) {
				return callback("data not exists. ");
			}

			bookshelfService.adjustCode(data.id, 'view', 1, function() {
				callback(null, data);
			});
		}
	], function (err, data) {
		var result = responseHelper.getDefaultResult(req);
		if (err) {
			result.errorType = "request";
			result.errorMessage = "Invalid request parameter.";
			return res.render('view', result);
		}

		result.code = data;
		result.code.trainer_code = formatizeTrainerCode(result.code.trainer_code);
		result.code.country_name = commonUtil.getCountry(result.code.country_code).countryName;
		result.code.user_image = (result.code.user_image) ? result.code.user_image : serviceConfig.defaultUserImage;
		return res.render('view', result);
	});
});

router.post('/like', responseHelper.checkLoginWithResult, function(req, res) {
	return addAction('LIKE', req, res);
});

router.post('/dislike', responseHelper.checkLoginWithResult, function(req, res) {
	return addAction('DISLIKE', req, res);
});

var addAction = function(type, req, res) {
	var result = responseHelper.getDefaultResult(req);
	if (!req.isAuthenticated()) {
		result.errorType = "login";
		result.errorMessage = "You need login.";
		return res.json(result);
	}

	var codeId = req.body.code_id;
	if (!codeId) {
		result.errorType = "request";
		result.errorMessage = "Invalid request parameter.";
		return res.json(result);
	}

	var resultFunc = function (err, data) {
		if (err) {
			result.errorType = "database";
			result.errorMessage = "Can not save action.";
			return res.json(result);
		}

		if (!data) {
			result.errorType = "request";
			result.errorMessage = "Can not save action.";
			return res.json(result);
		}

		return res.json(result);
	};

	var likeFunc = function(user, codeId, type) {
			async.waterfall([
				function (callback) {
					bookshelfService.getCode(codeId, callback);
				},
				function (data, callback) {
					if (!data) {
						return callback("Code not found.");
					}
					bookshelfService.insertAction(user, data, type, callback);
				},
				function (data, callback) {
					if (!data) {
						return callback("can not save action.");
					}
					bookshelfService.adjustCode(codeId, type, 1, callback);
				}
			], resultFunc);
		};

	var cancelLikeFunc = function(user, codeId, type) {
		async.waterfall([
			function (callback) {
				bookshelfService.getCode(codeId, callback);
			},
			function (data, callback) {
				if (!data) {
					return callback("Code not found.");
				}
				bookshelfService.deleteAction(user, data, type, callback);
			},
			function (data, callback) {
				if (!data) {
					return callback("can not save action.");
				}
				bookshelfService.adjustCode(codeId, type, -1, callback);
			}
		], resultFunc);
	};

	bookshelfService.getAction(req.user, codeId, type, function(err, action) {
		if (action) {
			result.isCancel = true;
			return cancelLikeFunc(req.user, codeId, type);
		}

		result.isCancel = false;
		return likeFunc(req.user, codeId, type);
	});
};

function formatizeTrainerCode(code) {
	var split = 4;
	var chunk = [];

	for (var i = 0, len = code.length; i < len; i += split) {
		split = 4;
		chunk.push(code.substr( i, split ) );
	}

	return chunk.join(" ");
};

// const multerConfig = {
// 	storage: multer.diskStorage({
// 		//Setup where the user's file will go
// 		destination: function(req, file, next){
// 			next(null, './public/img/photo-storage');
// 		},
//
// 		//Then give the file a unique name
// 		filename: function(req, file, next){
// 			console.log(file);
// 			const ext = file.mimetype.split('/')[1];
// 			next(null, file.fieldname + '-' + Date.now() + '.'+ext);
// 		}
// 	}),
//
// 	fileFilter: function(req, file, next){
// 		if(!file){
// 			next();
// 		}
// 		const image = file.mimetype.startsWith('image/');
// 		if(image){
// 			console.log('photo uploaded');
// 			next(null, true);
// 		}else{
// 			console.log("file not supported");
//
// 			//TODO:  A better message response to user on failure.
// 			return next();
// 		}
// 	}
// };
//
// router.get('/test',  multer(multerConfig).single('image'), function(req,res){
// 	ocr.regognize(req.file, function() {
// 		logger.info('Complete!');
// 		res.render('register');
// 	});
//
// });

router.get('/my', responseHelper.checkLoginWithRedirect, function(req, res){
	var userId = req.user.user_id;
	async.waterfall([
		function(callback) {
			bookshelfService.getCodes(userId, callback);
		}
	], function (err, data) {
		var result = responseHelper.getDefaultResult(req);

		if (err) {
			result.errorType = "request";
			result.errorMessage = "Invalid request parameter.";
			return res.render('myView', result);
		}

		data.forEach(function(o) {
			o.trainer_code = formatizeTrainerCode(o.trainer_code);
			o.country_name = commonUtil.getCountry(o.country_code).countryName;
			o.user_image = (o.user_image) ? o.user_image : serviceConfig.defaultUserImage;
		});

		result.codes = data;

		return res.render('myView', result);
	});
});

router.post('/delete', responseHelper.checkLoginWithResult, function(req, res){
	var id = req.body.code_id,
		userId = req.user.user_id,
		countryCode = req.body.country_code;

	if (!userId || !id || !countryCode) {
		var result = responseHelper.getDefaultResult(req);
		result.errorType = "request";
		result.errorMessage = "Invalid request parameter.";
		return res.json(result);
	}

	async.waterfall([
		function(callback) {
			bookshelfService.deleteMyCode(userId, id, callback);
		},
		function(data, callback) {
			bookshelfService.adjustCountryCount(countryCode, -1, function(err) {
				if (err) {
					logger.error("can not decrease country count. country: " + countryCode);
				}
				callback(null, data);
			});
		}
	], function (err, data) {
		var result = responseHelper.getDefaultResult(req);
		if (err) {
			logger.error(err);
			result.errorType = "database";
			result.errorMessage = "Can not save action.";
			return res.json(result);
		}

		return res.json(result);
	});
});

router.post('/search/country', responseHelper.checkLoginWithResult, function(req, res){
	var userId = req.user.user_id;
	async.waterfall([
		function(callback) {
			bookshelfService.getCodes(userId, function(err, data){
				if (!data || data.length == 0) {
					var result = responseHelper.getDefaultResult(req);
					result.continent = req.body.continent;
					result.errorType = "register";
					result.errorMessage = "First, register your code!";
					return res.json(result);
				}

				callback(err, null);
			});
		},
		function(data, callback) {
			mysqlService.getRandomCode({
				userId: userId,
				countryCode: req.body.country_code,
				continent: req.body.continent
			}, callback);
		},
		function(data, callback) {
			if (!data) {
				// logger.warn("failed to select random code: userId: " + req.user.user_id + ", country: " + req.body.country_code);
				return callback(null, null);
			}

			bookshelfService.adjustCode(data.id, 'view', 1, function() {
				callback(null, data);
			});
		},
		function(data, callback) {
			if (!data) {
				return callback(null, null);
			}

			// check whether already like
			bookshelfService.getAction(req.user, data.id, "LIKE", function(err, action) {
				if (action) {
					data.liked = true;
				};
				callback(null, data);
			});
		},
		function(data, callback) {
			if (!data) {
				return callback(null, null);
			}

			// check whether already dislike
			bookshelfService.getAction(req.user, data.id, "DISLIKE", function(err, action) {
				if (action) {
					data.disliked = true;
				};
				callback(null, data);
			});
		}
	], function (err, data) {
		var result = responseHelper.getDefaultResult(req);
		result.continent = req.body.continent;

		if (err) {
			logger.warn("failed to increase view: userId: " + req.user.user_id);
			result.errorType = "request";
			result.errorMessage = "Invalid request parameter.";
			return res.json(result);
		}

		if (!data) {
			return res.json(result);
		}

		result.code = {
			id: data.id,
			view: data.view + 1,
			like: data.like,
			trainer_name: data.trainer_name,
			trainer_code: formatizeTrainerCode(data.trainer_code),
			country_code: data.country_code,
			country_name: commonUtil.getCountry(data.country_code).countryName,
			user_image: (data.user_image) ? data.user_image : serviceConfig.defaultUserImage,
			comment: data.comment,
			liked: data.liked,
			disliked: data.disliked
		};

		return res.json(result);
	});
});

router.post('/search/continent', function(req, res){
	var result = responseHelper.getDefaultResult(req),
		continent = req.body.continent;

	if (!continent) {
		result.errorType = "request";
		result.errorMessage = "Invalid request parameter.";
		return res.json(result);
	}

	mysqlService.getCountriesByContinent(continent, function(err, data) {
		if (err) {
			result.errorType = "request";
			result.errorMessage = "Invalid request parameter.";
			return res.json(result);
		}

		if (!data) {
			data = [];
		}
		data.unshift({ country_code: "ALL", country_name: "ALL" });

		result.countries = data;
		return res.json(result);
	});
});

router.get('/search', function(req, res){
	var result = responseHelper.getDefaultResult(req);

	var continent = req.query.continent;
	if (continent) {
		mysqlService.getCountriesByContinent(continent, function(err, data) {
			if (err) {
				result.errorType = "request";
				result.errorMessage = "Invalid request parameter.";
				return res.render('search', result);
			}

			if (!data) {
				data = [];
			}
			data.unshift({ country_code: "ALL", country_name: "ALL" });
			result.countries = data;
			result.continent = continent;
			return res.render('search', result);
		});
	} else {
		result.continent = "";
		return res.render('search', result);
	}
});

module.exports = router;
