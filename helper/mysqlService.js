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
		if (data.countryCode) {
			where = where + " and country_code = '" + data.countryCode + "'"
		}
		var sql = 'select * from code ' + where + ' order by rand() limit 1';
		logger.info(sql);
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