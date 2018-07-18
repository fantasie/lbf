var bcrypt = require('bcryptjs'),
	models = require('./../dao/models'),
	serviceConfig = require('./../config/serviceConfig');

var logger = require('log4js').getLogger('helper/bookshelfService.js');

exports.getUser = function(userId, callback) {
	models.models.User.forge({ user_id: userId })
		.fetch()
		.then(function (user) {
			if (!user) {
				return callback(null, null);
			}

			callback(null, user.toJSON());
		})
		.catch(function (err) {
			logger.error(err);
			return callback(err, null);
		});
};

exports.fillUserConfig = function(userId, name, countryCode, callback) {
	models.models.User
		.where({ user_id: userId })
		.save({ name: name, country_code: countryCode },{patch:true})
		.then(function (user) {
			if (!user) {
				return callback(null, null);
			}

			callback(null, user.toJSON());
		})
		.catch(function (err) {
			logger.error(err);
			return callback(err, null);
		});
};

exports.insertUser = function(profile, callback) {
	var userId = profile.id + '@googleplus',
		image = profile.photos[0] && profile.photos[0].value,
		email = profile.emails[0] && profile.emails[0].value;

	bcrypt.genSalt(8, function (err, salt) {
		var password = salt;
		bcrypt.hash(password, salt, function (err, hash) {
			password = hash;
			models.models.User.forge({
				user_id: userId,
				password: password,
				salt: salt,
				from: 'google',
				name: profile.displayName,
				email: email,
				image: image
			})
			.save()
			.then(function (user) {
				return callback(null, user.toJSON());
			})
			.catch(function (err) {
				logger.error(err);
				return callback(err, null);
			});
		});
	});
};

exports.insertCode = function(user, data, callback) {
	models.models.Code.forge({
		user_id: user.user_id,
		name: user.name,
		user_image: user.image,
		comment: data.comment,
		country_code: data.countryCode,
		trainer_code: data.trainerCode,
		trainer_name: data.trainerName,
		continent: data.continent
	})
	.save()
	.then(function (code) {
		return callback(null, code.toJSON());
	})
	.catch(function (err) {
		logger.error(err);
		return callback(err, null);
	});
};

exports.updateCode = function(user, data, callback) {
	models.models.Code
		.where({ user_id: user.user_id, id: data.id })
		.save({
			name: user.name,
			user_image: data.userImage,
			comment: data.comment,
			country_code: data.countryCode,
			trainer_code: data.trainerCode,
			trainer_name: data.trainerName,
			continent: data.continent
		},{patch:true})
		.then(function (code) {
			if (!code) {
				return callback(null, null);
			}
			return callback(null, code.toJSON());
		})
		.catch(function (err) {
			logger.error(err);
			return callback(err, null);
		});
};

exports.getPopularCountries = function(callback) {
	models.models.Country.query(function (qb) {
		qb.orderBy('count', 'DESC');
		qb.limit(16);
	}).fetchAll()
	.then(function (countries) {
		callback(null, countries.toJSON());
	})
	.catch(function (err) {
		logger.error(err);
		return callback(err, null);
	});
};

exports.getCountry = function(countryCode, callback) {
	models.models.Country.forge({ country_code: countryCode })
		.fetch()
		.then(function (country) {
			if (!country) {
				return callback(null, null);
			}

			return callback(null, country.toJSON());
		})
		.catch(function (err) {
			logger.error(err);
			return callback(err, null);
		});
};

exports.getCode = function(id, callback) {
	models.models.Code.forge({ id: id })
	.fetch()
	.then(function (code) {
		if (!code) {
			return callback(null, null);
		}

		return callback(null, code.toJSON());
	})
	.catch(function (err) {
		logger.error(err);
		return callback(err, null);
	});
};

exports.getMyCode = function(userId, id, callback) {
	models.models.Code.forge({ id: id, user_id: userId })
		.fetch()
		.then(function (code) {
			if (!code) {
				return callback(null, null);
			}
			return callback(null, code.toJSON());
		})
		.catch(function (err) {
			logger.error(err);
			return callback(err, null);
		});
};

exports.deleteMyCode = function(userId, id, callback) {
	models.models.Code.where({ id: id, user_id: userId })
		.destroy()
		.then(function(result) {
			return callback(null, result);
		})
		.catch(function (err) {
			logger.error(err);
			return callback(err, null);
		});
};

exports.getCodes = function(userId, callback) {
	models.models.Code.where({ user_id: userId })
		.fetchAll()
		.then(function (codes) {
			if (!codes) {
				return callback(null, null);
			}

			return callback(null, codes.toJSON());
		})
		.catch(function (err) {
			logger.error(err);
			return callback(err, null);
		});
};

exports.getCountryList = function(callback) {
	models.models.Country.forge()
		.fetchAll()
		.then(function (countries) {
			if (!countries) {
				return callback(null, null);
			}

			return callback(null, countries.toJSON());
		})
		.catch(function (err) {
			logger.error(err);
			return callback(err, null);
		});
};

exports.adjustCode = function(codeId, column, increment, callback) {
	models.models.Code
		.query()
		.where('id', codeId)
		.increment(column, increment)
		.then(function (result) {
			return callback(null, result);
		})
		.catch(function (err) {
			logger.error(err);
			return callback(err, null);
		});
};

exports.adjustCountryCount = function(countryCode, increment, callback) {
	models.models.Country
		.query()
		.where('country_code', countryCode)
		.increment('count', increment)
		.then(function (result) {
			return callback(null, result);
		})
		.catch(function (err) {
			logger.error(err);
			return callback(err, null);
		});
};

exports.getAction = function(user, codeId, type, callback) {
	models.models.Action.forge({
		user_id: user.user_id,
		type: type,
		code_id: codeId
	})
	.fetch()
	.then(function (action) {
		if (!action) {
			return callback(null, null);
		}

		return callback(null, action.toJSON());
	})
	.catch(function (err) {
		logger.error(err);
		return callback(err, null);
	});
};

exports.insertAction = function(user, code, type, callback) {
	models.models.Action.forge({
		user_id: user.user_id,
		type: type,
		other_user_id: code.user_id,
		code_id: code.id
	})
	.save()
	.then(function (action) {
		return callback(null, action.toJSON());
	})
	.catch(function (err) {
		logger.error(err);
		return callback(err, null);
	});
};

exports.deleteAction = function(user, code, type, callback) {
	models.models.Action.where({
		user_id: user.user_id,
		type: type,
		other_user_id: code.user_id,
		code_id: code.id
	})
	.destroy()
	.then(function (result) {
		return callback(null, result);
	})
	.catch(function (err) {
		logger.error(err);
		return callback(err, null);
	});
};
