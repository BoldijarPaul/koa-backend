var express = require('express');
var app = express();
var request = require('request');

app.get('/', function(req, res) {
    res.send('Hello World!');
})
var url = 'https://graph.facebook.com/id/picture?type=large';
var html = '<!DOCTYPE html>\r\n<html>\r\n<body>\r\n \r\n<canvas id=\"myCanvas\" width=\"452\" height=\"640\" style=\"border:1px solid #000000;\">\r\nYour browser does not support the HTML5 canvas tag.\r\n</canvas>\r\n \r\n<script>\r\nvar img = new Image;\r\nimg.src = \"https://s30.postimg.org/91z7fvxld/b19.png\";\r\n \r\nvar img2= new Image;\r\nimg2.src= \"%url\";\r\n \r\nvar c = document.getElementById(\"myCanvas\");\r\nvar ctx = c.getContext(\"2d\");\r\nctx.fillStyle = \"#FF0000\";\r\nimg.onload = function() {\r\nctx.drawImage(img,0,0);\r\n\r\nimg2.onload = function() {\r\nctx.drawImage(img2,150,430,100,100);\r\n}\r\n}\r\n\r\n</script>\r\n</body>\r\n</html>';
app.get('/poza/:id', function(req, res) {
    var isnum = /^\d+$/.test(req.params.id);
    if(isnum){
         var imageUrl= url.replace('id', req.params.id);
          res.send(html.replace('%url', imageUrl));
        return;
    }
    request.post('http://findmyfbid.com', {
            form: {
                url: req.params.id
            }
        })
        .on('response', function(response) {
            var fbId = response.headers.location.replace('http://findmyfbid.com/success/', '');
            var imageUrl = url.replace('id', fbId);
            res.send(html.replace('%url', imageUrl));
        });
})

app.listen(process.env.PORT, process.env.IP, function() {
    console.log('Start');
})
