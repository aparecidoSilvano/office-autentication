/**
 * Created by silva on 05/08/2016.
 */
var credentials = {
    clientID: "0de6756b-a91c-4ad5-a542-c6ae3f22c5a9",
    clientSecret: "whqXefnsdfcqvJSc4AZ4Vn8",
    site: "https://login.microsoftonline.com/common",
    authorizationPath: "/oauth2/v2.0/authorize",
    tokenPath: "/oauth2/v2.0/token"
}
var oauth2 = require("simple-oauth2")(credentials);

var redirectUri = "http://localhost:8080/authorize";

// The scopes the app requires
var scopes = ["openid",
    "profile",
    "https://outlook.office.com/mail.read",
    "https://outlook.office.com/calendars.read"];

function getAuthUrl() {
    var returnVal = oauth2.authCode.authorizeURL({
        redirect_uri: "http://localhost:8080/authorize",
        scope: scopes.join(" ")
    });
    console.log("Generated auth url: " + returnVal);
    return returnVal;
}

function getTokenFromCode(auth_code, callback, response) {
    var token;
    oauth2.authCode.getToken({
        code: auth_code,
        redirect_uri: redirectUri,
        scope: scopes.join(" ")
    }, function (error, result) {
        if (error) {
            console.log('Access token error: ' + error.message);
            callback(response, error, null);
        } else {
            token = oauth2.accessToken.create(result);
            console.log('Token created: ' + token.token);
            callback(response, null, token);
        }
    });
}

function getEmailFromIdToken(id_token) {
    // JWT is in three parts, separeted by a '.'
    var token_parts = id_token.split('.');

    // token content is in the second part, in urlsafe base64
    var encoded_token = new Buffer(token_parts[1].replace("-", "_").replace("+", "/"), 'base64');

    var decoded_token = encoded_token.toString();

    var jwt = JSON.parse(decoded_token);

    // Email is in the preferred_username field
    return jwt.preferred_username
}

exports.getEmailFromIdToken = getEmailFromIdToken;

exports.getTokenFromCode = getTokenFromCode;

exports.getAuthUrl = getAuthUrl;
