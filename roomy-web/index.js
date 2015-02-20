var express = require('express')
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.json());

app.get('/', function(request, response) {
  response.send("<b>There is no data here.</b> <br/> You were probably looking for our website at <a href='www.roomy.com'>www.roomy.com</a> <br/> </br> </hr> <i>Roomy v1</i>");
});

app.get('/viewrooms', function (request, response) {
    pg.connect(process.env.DATABASE_URL, function (err, client, done) {
        client.query("SELECT * FROM tblrooms", function (err, result) {
            done();
            if (err) {
                response.send("Error: " + err);
            } else {
                response.send(result.rows);
                
            }
        });
    });
});

app.post('/roomstat', function (request, response) {
    var roomstat = request.body.avail;
    var devid = request.body.devid;

    var query = "UPDATE tblrooms SET avail = '" + roomstat + "' WHERE devid='" + devid + "'";

    pg.connect(process.env.DATABASE_URL, function (err, client, done) {
        client.query(query, function (err, result) {
            done();
            if (err) {
                response.send("Error: " + err);
            } else {
                response.send("OK");
            }
        });
    });
});

app.post('/addroom', function (request, response) {
    var building = request.body.building;
    var room = request.body.room;
    var devid = request.body.devid;

    var query = "INSERT INTO tblrooms (building, room, devid) values ('" + building + "', '" + room + "', '"  + devid + "')";

    pg.connect(process.env.DATABASE_URL, function (err, client, done) {
        client.query(query, function (err, result) {
            done();
            if (err) {
                response.send("Error: " + err);
            } else {
                response.send("Room " + building + " " + room + " added!");
            }
        });
    });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})