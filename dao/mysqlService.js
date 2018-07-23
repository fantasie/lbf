var mysql      = require('mysql'),
	dbConfig = require('./../config/dbConfig'),
	env = process.env.NODE_ENV || 'production',
	config = dbConfig[env].rdb;

var logger = require('log4js').getLogger('helper/mysqlService.js');

var mysqlConfig = {
	host: config.host,
	user: config.user,
	password: config.password,
	port: config.port,
	database: config.database,
	connectionLimit: 50
};

var pool = mysql.createPool(mysqlConfig);

exports.getRandomCode = function(data, callback) {
	pool.getConnection(function (err, connection) {
		if (err) {
			logger.error("can not get mysql connection.");
			connection.release();
			return callback(err);
		}

		var where = "where user_id != '" + data.userId + "'";
		if (data.countryCode && data.countryCode != "ALL") {
			where = where + " and country_code = '" + data.countryCode + "'"
		}

		if (data.continent) {
			where = where + " and continent = '" + data.continent + "'"
		}

		if (data.codeId) {
			where = where + " and id != " + data.codeId;
		}
		var sql = 'select * from code ' + where + ' order by rand() limit 1';
		connection.query(sql, function (err, result) {
			if (err) {
				logger.error("can not execute mysql query: " + sql + ", " + err);
				connection.release();
				return callback(err);
			}

			connection.release();
			return callback(null, result[0]);
		});
	});
};

exports.getRandomCodeList = function(data, callback) {
	pool.getConnection(function (err, connection) {
		if (err) {
			logger.error("can not get mysql connection.");
			connection.release();
			return callback(err);
		}

		var where = " where code.user_id != '" + data.userId + "'";
		if (data.countryCode && data.countryCode != "ALL") {
			where = where + " and code.country_code = '" + data.countryCode + "'"
		}

		if (data.continent) {
			where = where + " and code.continent = '" + data.continent + "'"
		}

		if (data.lastCodeId && data.lastCodeId > 0) {
			where = where + " and code.id < " + data.lastCodeId;
		}

		var sql = "select code.*, a1.type as liked, a2.type as disliked from code "
				+ " left join `action` as a1 on a1.user_id='" + data.userId + "' and code.user_id = a1.other_user_id and code.id = a1.code_id and a1.type = 'LIKE'"
				+ " left join `action` as a2 on a2.user_id='" + data.userId + "' and code.user_id = a2.other_user_id and code.id = a2.code_id and a2.type = 'DISLIKE'"
				+ where
				+ " order by code.id desc limit " + data.count;
		logger.debug(sql);
		connection.query(sql, function (err, result) {
			if (err) {
				logger.error("can not execute mysql query: " + sql + ", " + err);
				connection.release();
				return callback(err);
			}

			connection.release();
			return callback(null, result);
		});
	});
};

exports.getCountriesByContinent = function(continent, callback) {
	pool.getConnection(function (err, connection) {
		if (err) {
			logger.error("can not get mysql connection.");
			connection.release();
			return callback(err);
		}

		var where = "where count > 0 and continent = '" + continent + "'";
		var sql = 'select country_code, country_name, continent from country ' + where + ' order by count desc';
		connection.query(sql, function (err, result) {
			if (err) {
				logger.error("can not excute mysql query: " + sql + ", " + err);
				connection.release();
				return callback(err);
			}

			connection.release();
			return callback(null, result);
		});
	});
};

exports.getContinentCounts = function(callback) {
	pool.getConnection(function (err, connection) {
		if (err) {
			logger.error("can not get mysql connection.");
			connection.release();
			return callback(err);
		}

		var sql = 'select continent, sum(`count`) as `count` from country group by continent';
		connection.query(sql, function (err, result) {
			if (err) {
				logger.error("can not excute mysql query: " + sql + ", " + err);
				connection.release();
				return callback(err);
			}

			connection.release();
			return callback(null, result);
		});
	});
};