var moment = require('moment'),
    fs = require('fs'),
    path = require('path'),
    bookshelfService = require('./../dao/bookshelfService');

var logger = require('log4js').getLogger('utils/commonUtil.js');

exports.isActionAvailable = function(lastActionTime, actionLimitSecs) {
    if (!lastActionTime || !actionLimitSecs) {
        return true;
    }

    var now = moment(),
        diffSecs = (now - moment(lastActionTime) / 1000),
        result = (diffSecs >= actionLimitSecs);

    return result;
};

var countryCodeMap = function(){
    var url = path.resolve(__dirname, "./../public/resources/countries.json"),
        contents = fs.readFileSync(url);

    var arr = JSON.parse(contents),
        map = { };

    arr.forEach(function(obj){
        map[obj.name] = obj.code;
    });

    return map;
}();


var continentNameMap = {
    AF:	"Africa",
    NA:	"North America",
    OC:	"Oceania",
    AN:	"Antarctica",
    AS:	"Asia",
    EU:	"Europe",
    SA:	"South America"
    },
    countryMap = {},
    continentCountriesMap = {};

var loadCountryMap = function (){
    var url = path.resolve(__dirname, "./../public/resources/countries.json"),
        contents = fs.readFileSync(url);

    var arr = JSON.parse(contents),
        nameMap = { },
        map = { };

    arr.forEach(function(obj){
        nameMap[obj.code] = obj.name;
    });

    bookshelfService.getCountryList(function(err, countries) {
        if (err || !countries) {
            logger.error("can not load continent data: " + err);
            return;
        }

        countries.forEach(function(country) {
            var countryCode = country.country_code;
            var obj = {
                countryName: nameMap[countryCode],
                continent: country.continent,
                countryCode: countryCode
            };

            map[countryCode] = obj;

            if (!continentCountriesMap[country.continent]) {
                continentCountriesMap[country.continent] = [];
            }

            continentCountriesMap[country.continent].push(obj);
        });

        countryMap = map;
        logger.info("country map load. : " + Object.keys(countryMap).length);
    });
}();


exports.getCountryCode = function(countryName) {
    return countryCodeMap[countryName];
};

exports.getCountry = function(countryCode) {
    return countryMap[countryCode];
};

exports.getContinentName = function(continentCode) {
    return continentNameMap[continentCode];
};

exports.getCountriesByContinent = function(continentCode) {
    return continentCountriesMap[continentCode];
};
