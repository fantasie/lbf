var Tesseract = require('tesseract.js'),
    path = require('path'),
    gm = require('gm');

var logger = require('log4js').getLogger('utils/ocr.js');

exports.regognize = function(image, callback) {
    var image = (path.resolve(__dirname, 'code_sample.png'));

    Tesseract.create({
        langPath: path.join(__dirname, '../tesseract/langs/'),
        workerPath: path.join(__dirname, '../tesseract/src/node/worker.js'),
        corePath: path.join(__dirname, '../tesseract/src/index.js')
    })
    .recognize(image, {
        lang: "eng",
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 "
    })
    .then(function(result){
        logger.info(result.text);
        callback();
    })
    .catch(function(err){
        logger.error("Error occurs: " + err);
        callback(null);
    });
};
