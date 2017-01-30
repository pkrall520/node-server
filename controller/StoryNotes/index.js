module.exports = function( io ) {
  
  var http = require("http"),
  ajax = function( options, emitStr, socket ) {
    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
          chunks.push(chunk);
        });

        res.on("end", function () {
          var body = Buffer.concat(chunks);
          console.log(body.toString())
          try {
            socket.emit( emitStr, { data : JSON.parse( body.toString() ) , status : 200 });
          } catch ( e ) {
            socket.emit( emitStr, {data : '' , status : 500 });
          }
        });
      });
      req.end();
  };

  io.on('connection', function(socket){

    socket.on('get_sprint', function( request ) {
      console.log('get_sprint ', request)
      var auth = new Buffer( request.username + ':' + request.password ).toString('base64');
        var options = {
          "method": "GET",
          "hostname": "lshca307a.pncbank.com",
          "port": "8080",
          "path": "/rest/api/2/search?maxResults=100&jql=Sprint=" + request.id + "%20and%20issuetype=7",
          "headers": {
          "authorization": "Basic " + auth,
          "cache-control": "no-cache",
        }
      };
      ajax( options, 'sprintData', socket );
    });


  });
}