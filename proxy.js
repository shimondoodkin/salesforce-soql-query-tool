/*global process */

/**
 * Module dependencies.
 */
var express = require('express'),
    https = require('https'),
    path = require('path'),
    request = require('request');
var fs = require('fs');

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 8080 /*|| 3123*/);
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

var proxyCounter = 0;

app.all('/proxy/?*', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Authorization,Content-Type,Salesforceproxy-Endpoint,X-Authorization,X-SFDC-Session,SOAPAction,SForce-Auto-Assign');
  res.header('Access-Control-Expose-Headers', 'SForce-Limit-Info');
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  var contentType = "application/x-www-form-urlencoded";
  var sfEndpoint = req.headers["salesforceproxy-endpoint"];
  if (!/^https:\/\/[a-zA-Z0-9\.\-]+\.(force|salesforce|database)\.com\//.test(sfEndpoint)) {
    res.send(400, "Proxying endpoint is not allowed.");
    return;
  }
  var params = {
    url: sfEndpoint || "https://login.salesforce.com//services/oauth2/token",
    method: req.method,
    headers: {
      "Content-Type": req.headers["content-type"],
      "Authorization": req.headers["x-authorization"] || req.headers.authorization,
      "X-SFDC-Session": req.headers["x-sfdc-session"]
    }
  };
  proxyCounter++;
  console.log("(++req++) " + new Array(proxyCounter+1).join('*'));
  console.log("method=" + params.method + ", url=" + params.url);
  req.pipe(request(params))
    .on('response', function() {
      proxyCounter--;
      console.log("(--res--) " + new Array(proxyCounter+1).join('*'));
    })
    .on('error', function() {
      proxyCounter--;
      console.log("(--err--) " + new Array(proxyCounter+1).join('*'));
    })
    .pipe(res);
});

 
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
  console.log('request /, sende index.html');
  res.type('.html').send( fs.readFileSync('public/index.html'));
});

https.createServer({    key:  fs.readFileSync('key.pem'),    cert: fs.readFileSync('cert.pem')},app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
