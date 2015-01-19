var http = require('http');
var net = require('net');
var jspack = require('jspack');
var os = require('os');

function getLocalIPAddress() {
  var interfaces = os.networkInterfaces();

  var ipAddress = "127.0.0.1";
  for (var interfaceName in interfaces) {
    for (var interfaceKey in interfaces[interfaceName]) {
      var interface = interfaces[interfaceName][interfaceKey];
      if ("IPv4" != interface.family || interface.internal != false)
        continue;
      ipAddress = interface.address;
      break;
    }
  }
  return ipAddress;
}

String.prototype.endsWith = function(str) {
  return this.indexOf(str, this.length - str.length) != -1;
}

function genMsg(command) {
  //var header = jspack.jspack.Pack('! 4s I I b 4b', 'ISCP', 16, command.length, 0x1, 0x0, 0x0, 0x0);
  //console.log("HEADER: " + header);
  var header = "ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00";
  return header + command + '\r';
}

http.createServer(function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'})
  if (request.url.endsWith("/receiverOn")) {
    var client = net.connect(60128, "10.1.10.10", function () {
      console.log(genMsg("!1PWR01\r"));
      client.write(genMsg("!1PWR01\r"));
    });
    response.end('Turn receiver on\n');
  } else if (request.url.endsWith("/receiverOff")) {
    var client2 = net.connect(60128, "10.1.10.10", function () {
      client2.write(genMsg("!1PWR00\r"));
    });
    response.end('Turn receiver off\n');
  } else {
    response.end('Hello, World!\n');
  }
}).listen(80, getLocalIPAddress());
console.log('Server running @ http://' + getLocalIPAddress() + '/');
