var Q = require('bluebird'),
  requestLib = require('follow-redirects'),
  url = require('url');



/**
 * Check that given web URL exists.
 *
 * @param {String} reqUrl The web URL (can be https).
 * 
 * @return {Promsie}
 */
exports.check = function(reqUrl) {
  var defer = Q.defer(); 

  var urlObj = url.parse(reqUrl);

  var isHttps = ('https:' === urlObj.protocol);

  var protoFn = (isHttps ? requestLib.https : requestLib.http);

  var req = protoFn.request({
    hostname: urlObj.hostname,
    port: urlObj.port || (isHttps ? 443 : 80),
    path: urlObj.path,
    /*
    Although a HEAD request would be better some cloud storage providers 
    (such as S3) don't permit such requests unless the requester has specific 
    permission to do so.
     */
    method: 'GET'
  }, function(res) {
    if (200 !== res.statusCode) {
      defer.reject(new Error('URL cannot be accessed: ' + res.statusCode));
    } else {
      defer.resolve();
    }
  });

  req.end();

  req.on('error', function(err) {
    defer.reject(err);
  });

  return defer.promise;
};
