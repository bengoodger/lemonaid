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


function genMsg2(command) {
  //var header = jspack.jspack.Pack('! 4s I I b 4b', 'ISCP', 16, command.length, 0x1, 0x0, 0x0, 0x0);
  //console.log("HEADER: " + header);
  var header = "ISCP\x00\x00\x00\x10\x00\x00\x00\x0A\x01\x00\x00\x00";
  return header + command + '\r';
}

function trimHeader2(command) {
  var header = "ISCP\x00\x00\x00\x10\x00\x00\x00\x0A\x01\x00\x00\x00";
  return command.substring(header.length).trim();
}

function writeHTMLHead(response) {
  response.writeHead(200, {"Content-Type": "text/html"});
}

function writeJSONHead(response) {
  response.writeHead(200, {"Content-Type": "application/json"});
}



function LutronOutput(integrationId, level) {
  this.type = "output";
  this.integrationId = integrationId;
  this.level = level;
}

function LutronDevice(integrationId, ledCount) {
  this.type = "device";
  this.integrationId = integrationId;
  this.leds = new Array(ledCount);
}

function integrationIdKey(integrationId) {
  return "IntegrationId:" + integrationId;
}

function LutronConnection(devices) {
  this.devices = devices !== undefined ? devices : {};
  // Build a reverse mapping so we can update our model from Lutron response
  // messages which are only in terms of integration ids.
  this.integrationIdToDevice = {};
  for (var deviceName in this.devices) {
    var key = integrationIdKey(this.devices[deviceName].integrationId);
    this.integrationIdToDevice[key] = deviceName;
  }

  this.connect();
}

LutronConnection.prototype.logDevice = function(device) {
  var key = integrationIdKey(device.integrationId);
  var str = "";
  switch (device.type) {
    case "output":
      str = util.format("Device=%s IntegrationId=%d Level=%d",
                        this.integrationIdToDevice[key], device.integrationId,
                        device.level);
      break;
    case "device":
      var leds = device.leds.join(",");
      str = util.format("Device=%s IntegrationId=%d Leds=%s",
                        this.integrationIdToDevice[key], device.integrationId,
                        leds);
      break;
    default:
      break;
  }
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

LutronConnection.prototype.getDeviceForIntegrationId = function(integrationId) {
  var key = integrationIdKey(integrationId);
  if (key in this.integrationIdToDevice) {
    var deviceName = this.integrationIdToDevice[key];
    return this.devices[deviceName];
  }
  return null;
}

LutronConnection.prototype.parseData = function(data) {
  var data = data.split("\r\n").shift();
  if (data.substring(0, 5) == "QNET>")
    data = data.substring(5);
  data = data.trim();
  if (data == "")
    return;
  console.log("Lutron: data = |" + data + "|");
  var params = data.split(",");
  var device = this.getDeviceForIntegrationId(params[1]);
  if (device)
    this.logDevice(device);
  
  switch (params[0]) {
  case "~OUTPUT":
    if (device && (params[2] == 1))
      device.level = params[3];
    break;
  case "~DEVICE":
    if (device) {
      var ledIndex = params[3] - 81;
      if (ledIndex >= 0 && ledIndex < device.leds.length)
        device.leds[ledIndex] = params[4];
    }
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
      var command = "?OUTPUT," + [device.integrationId, 1].join(",") + "\r\n";
      this.client.write(command);
      break;
    case "device":
      for (var i = 0; i < device.leds.length; ++i) {
        var command = "?DEVICE," + [device.integrationId, 81+i, 9].join(",") +
            "\r\n";
        this.client.write(command);
      }
      break;
    }
  }
}

LutronConnection.prototype.handleData = function(data) {
  // Coerce stringiness
  data += "";
  switch (data.trim()) {
  case "login:":
    this.client.write("lutron\r\n", "UTF8");
    break;
  case "password:":
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
gDevices["FrontPorch_Pendants"] = new LutronOutput(14, 0);
gDevices["FrontPorch_Sconces"] = new LutronOutput(15, 0);
gDevices["Kitchen_MudRoom_Switch"] = new LutronDevice(60, 6);
gDevices["MudRoom_Garage_Switch"] = new LutronDevice(49, 6);

var lutronConnection = new LutronConnection(gDevices);

var iTachClient = null;
var iTachClientConnected = false;

function powerReceiverOn() {
  var client = net.connect(60128, "10.1.10.10", function () {
    console.log(genMsg("!1PWR01\r"));
    client.write(genMsg("!1PWR01\r"));
  });  
}

function powerReceiverOff() {
  var client2 = net.connect(60128, "10.1.10.10", function () {
    client2.write(genMsg("!1PWR00\r"));
  });
}

function powerTVOn() {
  iTachClient.write(new Buffer([0x8, 0x22, 0x0, 0x0, 0x0, 0x2, 0xd6]));
  powerReceiverOn();
}

function powerTVOff() {
  iTachClient.write(new Buffer([0x8, 0x22, 0x0, 0x0, 0x0, 0x1, 0xd5])); 
  powerReceiverOff();
}

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
  } else if (request.url.endsWith("/tv")) {
    fs.readFile("../fe/tv.html", "utf8", function(error, data) {
      if (error)
        return console.log(error);
      writeHTMLHead(response);
      response.write(data);
      response.end();
    });
  } else if (request.url.endsWith("/receiverPowerState")) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    var client = net.connect(60128, "10.1.10.10", function() {
      console.log("HELLO");
      client.write(genMsg2("!1AMTQSTN\r"));
    });
    client.on('data', function(data) {
      var sub = data.slice(16);
      sub = sub.slice(0, sub.length - 3);
console.log("data " + sub);
      //console.log("STR: "+ str.length + " STR: " + str);
      //console.log("ResponseData: " + trimHeader2(data + "") + "\n");
    });
    client.on('close', function(error) {
      console.log("++++ONCLOSE");
    });
    client.on('error', function(error) {
      console.log("++++ONERROR");
    });
    response.end("Foo");
  } else if (request.url.endsWith("/tvOn")) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end("TV ON!");
    if (!iTachClientConnected) {
      iTachClient = net.connect(4999, "10.1.10.51", function() {
        iTachClientConnected = true;
        powerTVOn();
      });
    } else {
      powerTVOn();
    }
  } else if (request.url.endsWith("/tvOff")) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end("TV ON!");
    if (!iTachClientConnected) {
      iTachClient = net.connect(4999, "10.1.10.51", function() {
        iTachClientConnected = true;
        powerTVOff();
      });
    } else {
      powerTVOff();
    }
  } else if (request.url.endsWith("/receiverOn")) {
    response.writeHead(200, {'Content-Type': 'text/plain'})
    powerReceiverOn();
    response.end('Turn receiver on\n');
  } else if (request.url.endsWith("/receiverOff")) {
    response.writeHead(200, {'Content-Type': 'text/plain'})
    powerReceiverOff();
    response.end('Turn receiver off\n');
  } else {
    response.writeHead(200, {'Content-Type': 'text/plain'})
    response.end('Hello, World!\n');
  }
}).listen(80, getLocalIPAddress());
console.log('Server running @ http://' + getLocalIPAddress() + '/');
