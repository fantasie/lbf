module.exports = {
	site: {
		siteUrl: "http://pokemongo-friends.soylab.net",
		title : "Let's be friends!",
		upperTitle : "LET'S BE FRIENDS!",
		loginUrl: "/account/login"
	},
	action: {
			registerLimitSecs: 30 * 60,	// 30분
			viewLimitSecs: 30 * 60, // 30분
	},
	account: {
		team: ['Valor', 'Mistic', 'Instinct'],
	},
	defaultUserImage: "/img/ball.png",
	defaultCountires: [{
		country_code: "JP",
		country_name: "Japan"
	},
	{
		country_code: "US",
		country_name: "United States"
	},
	{
		country_code: "GB",
		country_name: "United Kingdom"
	},
	{
		country_code: "KR",
		country_name: "Korea, Republic of"
	}],
};
