
var qs = require('querystring');
var jwt = require('jwt-simple');
var moment = require('moment');
var request = require('request');


module.exports = {

    login: function (req, res) {
      var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
      var authenticateUrl = 'https://api.twitter.com/oauth/authorize';
      var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';

      if (!req.query.oauth_token || !req.query.oauth_verifier) {
          return requestTwitterAuthPopup(req, res, requestTokenUrl, authenticateUrl);
      }

      var accessToken = {
          customer_key: config.auth.TWITTER_KEY,
          customer_secret: config.auth.TWITTER_SECRET,
          token: req.query.oauth_token,
          verifier: req.query.oauth_verifier
      };

      request.post({ url: accessTokenUrl, oauth: accessToken }, function (err, response, profile) {
          profile = qs.parse(profile);

          User.findOne({ twitter: profile.user_id }, function (err, response, user) {
              if (user) return res.send({ token: createToken(user) });

              var userData = {
                  twitter: profile.user_id,
                  displayName: profile.screen_name
              };

              User.create(userData).exec(function (err, created) {
                  res.send({ token: createToken(created) });
              });
          });
      });

  }

}

function requestTwitterAuthPopup(req, res, requestUrl, authUrl) {
    var requestToken = {
        consumer_key: config.auth.TWITTER_KEY,
        consumer_secret: config.auth.TWITTER_SECRET,
        callback: config.auth.TWITTER_CALLBACK
    };



    request.post({ url: requestUrl, oauth: requestToken }, function (err, response, token) {
        token = qs.parse(token);

        var params = qs.stringify({ oauth_token: token.oauth_token });
        res.redirect(authUrl + '?' + params);
    });
}

function createToken(user) {
    var payload = {
        sub: user.id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };

    return jwt.encode(payload, config.auth.TOKEN_SECRET);
}
