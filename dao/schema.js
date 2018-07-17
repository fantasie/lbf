var Schema = {
	users: {
		id: { type: 'increments', nullable: false, primary: true },
		user_id: { type: 'string', maxlength: 150, nullable: false, unique: true },
		name: { type: 'string', maxlength: 150, nullable: false, defaultTo: 'user' },
		country_code: { type: 'string', maxlength: 10, nullable: true },
		email: { type: 'string', maxlength: 254, nullable: false, unique: true },
		password: { type: 'string', nullable: false },
		salt: { type: 'string', nullable: false },
		created_at: { type: 'dateTime', nullable: false },
		updated_at: { type: 'dateTime', nullable: false },
		point: { type: 'integer', nullable: false, defaultTo: 100 },
		from: { type: 'string', maxlength: '50', nullable: true, defaultTo: 'organic' },
		image: { type: 'string', nullable: true },
		is_locked: { type: 'boolean', nullable: false, defaultTo: 0 },
		is_deleted: { type: 'boolean', nullable: false, defaultTo: 0 }
	},
	code: {
		id: { type: 'increments', nullable: false, primary: true },
		user_id: { type: 'string', maxlength: 150, nullable: false },
		name: { type: 'string', maxlength: 150, nullable: false},
		user_image: { type: 'string', nullable: true },
		created_at: { type: 'dateTime', nullable: false },
		updated_at: { type: 'dateTime', nullable: false },
		view: { type: 'integer', nullable: false, defaultTo: 0 },
		like: { type: 'integer', nullable: false, defaultTo: 0 },
		dislike: { type: 'integer', nullable: false, defaultTo: 0 },
		continent: { type: 'string', maxlength: 10, nullable: false },
		country_code: { type: 'string', maxlength:10, nullable: false },
		trainer_code: { type: 'string', maxlength: 20, nullable: false },
		trainer_name: { type: 'string', maxlength: 50, nullable: false},
		is_locked: { type: 'boolean', nullable: false, defaultTo: 0 },
		is_deleted: { type: 'boolean', nullable: false, defaultTo: 0 }
	},
	country: {
		id: { type: 'increments', nullable: false, primary: true },
		continent: { type: 'string', maxlength: 10, nullable: false },
		country_code: { type: 'string', maxlength: 10, nullable: false, unique: true },
		country_name: { type: 'string', maxlength: 150, nullable: false},
		count: { type: 'integer', nullable: false, defaultTo: 0 },
		updated_at: { type: 'dateTime', nullable: false },
	},
	action: {
		id: { type: 'increments', nullable: false, primary: true },
		user_id: { type: 'string', maxlength: 150, nullable: false},
		type: { type: 'string', maxlength: 20, nullable: false},
		other_user_id: { type: 'string', maxlength: 150, nullable: true},
		code_id: { type: 'integer', nullable: false, defaultTo: 0 },
		created_at: { type: 'dateTime', nullable: false },
		updated_at: { type: 'dateTime', nullable: false },
	},
};

module.exports = Schema;