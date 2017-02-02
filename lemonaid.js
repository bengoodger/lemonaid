var roku = require('node-roku');
roku.find(function(err, devices) {
	if (err)
		return;
	var firstDevice = devices[0];
	roku.getDevice(firstDevice, function(err, device) {
		if (!err)
			console.log(device);
	});
});

var static = require('node-static');
 
var file = new static.Server('./web');
require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    file.serve(request, response);
  }).resume();
}).listen(80);
