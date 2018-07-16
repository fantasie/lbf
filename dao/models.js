var dbConfig = require('./../config/dbConfig'),
	env = process.env.NODE_ENV || 'production',
	config = dbConfig[env].rdb;

var knex = require('knex')({
	client: config.client,
	connection: {
		host     : config.host,
		user     : config.user,
		password : config.password,
		database : config.database,
		charset  : config.define.charset,
		port     : config.port
	}
});

var Bookshelf = require('bookshelf')(knex);

var User = Bookshelf.Model.extend({
	tableName: 'users',
	hasTimestamps: true
});

var Country = Bookshelf.Model.extend({
	tableName: 'country',
	hasTimestamps: true
});

var Code = Bookshelf.Model.extend({
	tableName: 'code',
	hasTimestamps: true
});

var Action = Bookshelf.Model.extend({
	tableName: 'action',
	hasTimestamps: true
});

var models = {
	User: User,
	Code: Code,
	Country: Country,
	Action: Action
};

exports.models = models;