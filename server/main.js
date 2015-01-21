var http = require('http');
var net = require('net');
var os = require('os');
var fs = require('fs');
var util = require('util');

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

function writeHTMLHead(response) {
  response.writeHead(200, {"Content-Type": "text/html"});
}

function writeJSONHead(response) {
  response.writeHead(200, {"Content-Type": "application/json"});
}



function LutronOutput(id, integrationId, level) {
  this.type = "output";
  this.id = id;
  this.integrationId = integrationId;
  this.level = level;
}

function LutronDevice(id, integrationId, ledCount) {
  this.type = "device";
  this.id = id;
  this.integrationId = integrationId;
  this.leds = new Array(ledCount);
}

function LutronConnection(devices) {
  this.devices = devices !== undefined ? devices : {};
  // Build a reverse mapping so we can update our model from Lutron response
  // messages which are only in terms of integration ids.
  this.integrationIdToDevice = {};
  for (var deviceName in this.devices) {
    var key = "IntegrationID:" + this.devices[deviceName].integrationId;
    console.log("DEV:  "  + key);
    this.integrationIdToDevice[key] = deviceName;
  }

  this.connect();
}

LutronConnection.prototype.logDevice = function(device) {
  var str = util.format("Device=%s IntegrationId=%d Level=%d",
                        device.id, device.integrationId, device.level);
  console.log(str);
}

LutronConnection.prototype.connect = function() {
  this.client = net.connect(23, "10.1.10.32", function() {
    console.log("Connected to Lutron");
  });
  this.client.on("data", this.handleData.bind(this));
  this.client.on("end", this.handleError.bind(this));
  this.client.on("error", this.handleError.bind(this));
}

LutronConnection.prototype.reconnect = function() {
  setTimeout(this.connect.bind(this), 1000);
}

LutronConnection.prototype.parseData = function(data) {
  var data = data.split("\r\n").shift();
  console.log("Lutron: data = ||" + data + "||");
  var params = data.split(",");
  var prefix = params[0];
  var integrationId = params[1];
  switch (prefix) {
  case "~OUTPUT":
    var key = "IntegrationID:" + integrationId;
    if (key in this.integrationIdToDevice) {
      var deviceName = this.integrationIdToDevice[key];
      this.devices[deviceName].level = params[3];
      this.logDevice(this.devices[deviceName]);
    }
    break;
  case "~DEVICE":
    break;
  default:
    break;
  }
}

LutronConnection.prototype.command = function(id, level) {
  this.client.write("#DEVICE,60,1,3\r\n");
}

LutronConnection.prototype.handleConnected = function() {
  for (var deviceName in this.devices) {
    var device = this.devices[deviceName];
    switch (device.type) {
    case "output":
      this.client.write("?OUTPUT," + [device.integrationId, 1].join(","));
      break;
    case "device":
      for (var i = 0; i < device.leds.length; ++i)
        this.client.write("?DEVICE," + [device.integrationId, 81+i, 9].join(","));
      break;
    }
  }
}

LutronConnection.prototype.handleData = function(data) {
  // Coerce stringiness
  data += "";
  switch (data.trim()) {
  case "login:":
    console.log("Writing username...");
    this.client.write("lutron\r\n", "UTF8");
    break;
  case "password:":
    console.log("Writing password...");
    this.client.write("integration\r\n", "UTF8");
    this.handleConnected();
    break;
  default:
    this.parseData(data);
    break;
  }
}

LutronConnection.prototype.handleError = function() {
  console.log("Lutron: Connection Error");
  this.reconnect();
}

var gDevices = {};
gDevices["FrontPorch_Pendants"] = new LutronOutput("FrontPorch_Pendants", 14, 0);

var lutronConnection = new LutronConnection(gDevices);

http.createServer(function(request, response) {
  if (request.url.endsWith("/lutron/command")) {
    if (request.method == "POST" &&
        request.headers["content-type"] == "application/json") {
      var body = "";
      request.on("data", function(chunk) {
        body += chunk.toString();
      });
      request.on("end", function() {
        var command = JSON.parse(body);
        console.log("ID: " + command.id + " state: " + command.level);
      });
    }
  } else if (request.url.endsWith("/lutron/query")) {
    writeJSONHead(response);
    var queryResult = {};
    queryResult.id = "KitchenLightStatus";
    queryResult.system = "lutron";
    queryResult.type = "query";
    queryResult.level = 75.0;
    response.write(JSON.stringify(queryResult));
    response.end();
  } else if (request.url.endsWith("/lutron")) {
    fs.readFile("../fe/lutron.html", "utf8", function(error, data) {
      if (error)
        return console.log(error);
      writeHTMLHead(response);
      response.write(data);
      response.end();
    });
  } else if (request.url.endsWith("/receiverOn")) {
    response.writeHead(200, {'Content-Type': 'text/plain'})
    var client = net.connect(60128, "10.1.10.10", function () {
      console.log(genMsg("!1PWR01\r"));
      client.write(genMsg("!1PWR01\r"));
    });
    response.end('Turn receiver on\n');
  } else if (request.url.endsWith("/receiverOff")) {
    response.writeHead(200, {'Content-Type': 'text/plain'})
    var client2 = net.connect(60128, "10.1.10.10", function () {
      client2.write(genMsg("!1PWR00\r"));
    });
    response.end('Turn receiver off\n');
  } else {
    response.writeHead(200, {'Content-Type': 'text/plain'})
    response.end('Hello, World!\n');
  }
}).listen(80, getLocalIPAddress());
console.log('Server running @ http://' + getLocalIPAddress() + '/');
