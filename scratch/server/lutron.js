// 1. Connect to Lutron Controller

function LutronHomeWorksQS() {

}

LutronHomeWorksQS.prototype.send = function() {
  
}

LutronHomeWorksQS.prototype.connect = function() {
  this.reconnecting_ = false;
  this.client = net.connect({ "10.1.10.32", "23"});
  this.client.on("data", this.handleData.bind(this));
  this.client.on("error", this.handleError.bind(this));
  this.client.on("close", this.handleError.bind(this));
}

LutronHomeWorksQS.prototype.reconnect = function() {
  if (this.reconnecting_)
    return;
  this.reconnecting_ = true;
  setTimeout(this.connect.bind(this), 1000);
}

LutronHomeWorksQS.prototype.onConnect = function() {
  // TODO: query state of all devices.
}

LutronHomeWorksQS.prototype.handleData = function(data) {
  data += "";
  switch (data.trim()) {
  case "login:":
    this.send("lutron");
    break;
  case "password:":
    this.send("integration");
    this.onConnect();
    break;
  default:
    this.parseData(data.split("\r\n"));
  }
}

LutronHomeWorksQS.prototype.handleError = function(error) {
  this.reconnect();
}

LutronHomeWorksQS.prototype.parseData = function(commands) {

}

module.exports = LutronHomeWorksQS;
