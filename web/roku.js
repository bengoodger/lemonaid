function createRokuUI() {
  var rokuAppsDiv = document.querySelector('#roku-apps');
  for (var device in g_rokuDevices) {
    var url = g_rokuDevices[device] + '/query/apps';
    console.log('sending apps query to: ' + url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function(e) {
      var res = xhr.responseXML;
      console.log('nn: ' + res.firstChild.nodeName);
    };
    xhr.send(null);
  }
}

window.addEventListener('load', createRokuUI, false);