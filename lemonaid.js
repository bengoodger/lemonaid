var http = require('http');
var Route = require('../route/core/route.js');

var Lutron = require('../route/modules/lutron-radiora2/lutron-radiora2.js');
var Sonos = require('../route/modules/sonos/sonos.js');
var Web = require('../route/modules/web/web.js');
var Telnet = require('../route/modules/telnet/telnet.js');
var SamsungExLink = require('../route/modules/samsung_exlink/samsung_exlink.js');
var Integra = require('../route/modules/integra/integra.js');
var Tivo = require('../route/modules/tivo/tivo.js');

// Map of commands to routers that service that command.
var route = Route.create();

var livingroom_tv = route.addDevice({
  type : SamsungExLink,
  name : "FamilyRoomTV",
  init : { host: "10.1.10.209" }
});

var masterbedroom_tv = route.addDevice({
  type : SamsungExLink,
  name : "MasterBedroomTV",
  init : { host: "10.1.10.213" }
});

var masterbathroom_tv = route.addDevice({
  type : SamsungExLink,
  name : "MasterBathTV",
  init : { host: "10.1.10.214" }
});

var mastersuite_receiver = route.addDevice({
  type : Integra,
  name : "MasterSuiteReceiver",
  init : { host: "10.1.10.211" }
});

var mastersuite_tivo = route.addDevice({
  type : Tivo,
  name : "MasterSuiteTivo",
  init : { host: "10.1.10.210" }
});

var livingroom_receiver = route.addDevice({
  type : Integra,
  name : "FamilyRoomReceiver",
  init : { host: "10.1.10.206" }
});

var livingroom_tivo = route.addDevice({
  type : Tivo,
  name : "FamilyRoomTivo",
  init : { host: "10.1.10.205" }
});

var sonos = route.addDevice({
  type : Sonos,
  name : "Sonos",
  init : {
    components : {
      "Kitchen" : "10.1.10.23",
      "DiningRoom" : "10.1.10.21",
      "MasterBedroom" : "10.1.10.24",
      "MasterBathroom" : "10.1.10.20",
      "RumpusRoom" : "10.1.10.25",
      "LegoRoom" : "10.1.10.12",
      "Office" : "10.0.1.44",
      "Lanai" : "10.0.1.38"
      //"Landscape" : ???
    }
  }
});

var lutron = route.addDevice({
  type : Lutron,
  name : "Lutron",
  init : {
    host : "10.1.10.26",
    username : "lutron",
    password: "integration",
    devices : {
      "FrontPorchPendants" : { id : 14, type : Lutron.TYPE_LIGHT },
      "FrontDoorSconces" : { id : 15, type : Lutron.TYPE_LIGHT },
      "FamilyRoomRecessed" : { id : 19, type : Lutron.TYPE_LIGHT },
      "FamilyRoomChandelier" : { id : 20, type : Lutron.TYPE_LIGHT },
      "FamilyRoomPorch" : { id : 16, type : Lutron.TYPE_LIGHT },
      "DiningRoomChandelier" : { id : 21, type : Lutron.TYPE_LIGHT },
      "DiningRoomRecessed" : { id : 22, type : Lutron.TYPE_LIGHT },
      "DiningRoomCove" : { id : 25, type : Lutron.TYPE_LIGHT },
      "KitchenSinkAndNook" : { id : 26, type : Lutron.TYPE_LIGHT },
      "KitchenRecessed" : { id : 27, type : Lutron.TYPE_LIGHT },
      "KitchenIslandPendants" : { id : 28, type : Lutron.TYPE_LIGHT },
      "LanaiChandeliers" : { id : 17, type : Lutron.TYPE_LIGHT },
      "FoyerPendants" : { id : 31, type : Lutron.TYPE_LIGHT },
      "FoyerSconces" : { id : 32, type : Lutron.TYPE_LIGHT },
      "HallwayPendant" : { id : 33, type : Lutron.TYPE_LIGHT },
      "HallwayWallWashers" : { id : 34, type : Lutron.TYPE_LIGHT },
      "HallwayRecessed" : { id : 35, type : Lutron.TYPE_LIGHT },
      "KitchenCabinets" : { id : 36, type : Lutron.TYPE_LIGHT },
      "MasterBedroomRecessed" : { id : 37, type : Lutron.TYPE_LIGHT },
      "MasterBedroomCove" : { id : 38, type : Lutron.TYPE_LIGHT },
      "MasterBedroomChandelier" : { id : 39, type : Lutron.TYPE_LIGHT },
      "MasterBedroomDeck" : { id : 18, type : Lutron.TYPE_LIGHT },
      "MasterBathroomSconces" : { id : 40, type : Lutron.TYPE_LIGHT },
      "MasterBathroomRecessed" : { id : 41, type : Lutron.TYPE_LIGHT },
      "MasterBathroomShower" : { id : 42, type : Lutron.TYPE_LIGHT },
      "MasterBathroomFan" : { id : 43, type : Lutron.TYPE_LIGHT },
      "MudRoomRecessed" : { id : 45, type : Lutron.TYPE_LIGHT },

      "FamilyRoomRearPatioKeypad" : { id : 48, type : Lutron.TYPE_KEYPAD },
      "MudRoomGarageDoorKeypad" : { id : 49, type : Lutron.TYPE_KEYPAD },
      "DiningRoomChinaCabinetKeypad" : { id : 50, type : Lutron.TYPE_KEYPAD },
      "DiningRoomKitchenKeypad" : { id : 51, type : Lutron.TYPE_KEYPAD },
      "MasterBathKeypad" : { id : 52, type : Lutron.TYPE_KEYPAD },
      "HallwayMiddleKeypad" : { id : 53, type : Lutron.TYPE_KEYPAD },
      "HallwayEndKeypad" : { id : 54, type : Lutron.TYPE_KEYPAD },
      "MasterBedroomMainKeypad" : { id : 55, type : Lutron.TYPE_KEYPAD },
      "MasterBedroomBesideKeypad" : { id : 56, type : Lutron.TYPE_KEYPAD },
      "FoyerFrontDoorKeypad" : { id : 57, type : Lutron.TYPE_KEYPAD },
      "FoyerFamilyRoomKeypad" : { id : 58, type : Lutron.TYPE_KEYPAD },
      "FoyerStairsKeypad" : { id : 59, type : Lutron.TYPE_KEYPAD },
      "KitchenMudRoomKeypad" : { id : 60, type : Lutron.TYPE_KEYPAD },
      "KitchenLanaiKeypad" : { id : 61, type : Lutron.TYPE_KEYPAD },
      "MasterBedroomDeckKeypad" : { id : 63, type : Lutron.TYPE_KEYPAD },
    }
  }
});

var web = route.addDevice({
  type : Web,
  name : "Web",
  init : {
    port : 80,
    dir : __dirname + "/web/"
  }
});

// Simple map of events to commands.
route.addEventMap({
  "Web.FamilyRoom.WatchTV" : [
    "FamilyRoomTV.On",
    "FamilyRoomReceiver.On",
    "FamilyRoomReceiver.InputVideo2",
    "FamilyRoomTivo.TeleportNowPlaying"
  ],
  "Web.FamilyRoom.WatchMovie" : [
    "FamilyRoomTV.On",
    "FamilyRoomReceiver.On",
    "FamilyRoomReceiver.InputVideo2",
    "FamilyRoomTivo.TeleportNowPlaying",
    "Lutron.KitchenSinkAndNook.Off",
    "Lutron.KitchenRecessed.Off",
    "Lutron.KitchenIslandPendants.Off",
    "Lutron.KitchenCabinets.Off",
    "Lutron.DiningRoomRecessed.Off",
    "Lutron.DiningRoomChandelier.Off",
    "Lutron.DiningRoomCove.Off",
    "Lutron.FamilyRoomChandelier.Off",
    "Lutron.FamilyRoomRecessed.Off"
  ],
  "Web.FamilyRoom.PlayGame" : [
    "FamilyRoomTV.On",
    "FamilyRoomReceiver.On",
    "FamilyRoomReceiver.InputVideo3",
    "FamilyRoomTivo.TeleportNowPlaying"
  ],
  "Web.FamilyRoom.Off" : [
    "FamilyRoomTV.Off",
    "FamilyRoomReceiver.Off"
  ],

  //  Hard-coded web switches for media (TV/Speakers)
  "Web.MasterBedroom.WatchTV" : [
    "MasterBedroomTV.On",
    "MasterSuiteReceiver.On",
    "MasterSuiteReceiver.InputVideo3",
    "MasterSuiteTivo.TeleportNowPlaying"
  ],
  "Web.MasterBedroom.ChromeCast" : [
    "MasterBedroomTV.On",
    "MasterSuiteReceiver.On",
    "MasterSuiteReceiver.InputVideo1",
  ],
  "Web.MasterBathroom.WatchTV" : [
    "MasterBathTV.On",
    "MasterBathTV.InputHDMI3",
    "MasterSuiteReceiver.On",
    "MasterSuiteReceiver.InputVideo3",
    "MasterSuiteTivo.TeleportNowPlaying"
  ],
  "Web.MasterSuite.Off" : [
    "MasterBedroomTV.Off",
    "MasterBathTV.Off",
    "MasterSuiteReceiver.Off"
  ],
  "Web.MasterBathroom.WakeUpBen" : [
    "Lutron.MasterBathroomSconces.95",
    "Lutron.MasterBathroomRecessed.90",
    "Lutron.MasterBathroomShower.100",
    "Lutron.MasterBathroomFan.On",
    "MasterBathTV.On",
    "MasterBathTV.InputHDMI3",
    "MasterSuiteReceiver.On",
    "MasterSuiteReceiver.InputVideo3",
    "MasterSuiteTivo.TeleportNowPlaying",
    "MasterSuiteTivo.Select",
    "MasterSuiteTivo.Select",
  ],
});

var LUTRON_PREFIX = "Web.Lutron.";
route.map(LUTRON_PREFIX + "*", function(eventname, data) {
  lutron.exec(eventname.substring(LUTRON_PREFIX.length));
});

var SONOS_PREFIX = "Web.Sonos.";
route.map(SONOS_PREFIX + "*", function(eventname, data) {
  sonos.exec(eventname.substring(SONOS_PREFIX.length));
});

var FAMILYROOM_TV_PREFIX = "Web.FamilyRoomTV.";
route.map(FAMILYROOM_TV_PREFIX + "*", function(eventname, data) {
  livingroom_tv.exec(eventname.substring(FAMILYROOM_TV_PREFIX.length));
});

var MASTERBEDROOM_TV_PREFIX = "Web.MasterBedroomTV.";
route.map(MASTERBEDROOM_TV_PREFIX + "*", function(eventname, data) {
  masterbedroom_tv.exec(eventname.substring(MASTERBEDROOM_TV_PREFIX.length));
});

var MASTERBATHROOM_TV_PREFIX = "Web.MasterBathroomTV.";
route.map(MASTERBATHROOM_TV_PREFIX + "*", function(eventname, data) {
  masterbathroom_tv.exec(eventname.substring(MASTERBATHROOM_TV_PREFIX.length));
});

var MASTERSUITE_RECEIVER_PREFIX = "Web.MasterSuiteReceiver.";
route.map(MASTERSUITE_RECEIVER_PREFIX + "*", function(eventname, data) {
  mastersuite_receiver.exec(eventname.substring(MASTERSUITE_RECEIVER_PREFIX.length));
});

var MASTERSUITE_TIVO_PREFIX = "Web.MasterSuiteTivo.";
route.map(MASTERSUITE_TIVO_PREFIX + "*", function(eventname, data) {
  mastersuite_tivo.exec(eventname.substring(MASTERSUITE_TIVO_PREFIX.length));
});

var FAMILYROOM_RECEIVER_PREFIX = "Web.FamilyRoomReceiver.";
route.map(FAMILYROOM_RECEIVER_PREFIX + "*", function(eventname, data) {
  livingroom_receiver.exec(eventname.substring(FAMILYROOM_RECEIVER_PREFIX.length));
});

var FAMILYROOM_TIVO_PREFIX = "Web.FamilyRoomTivo.";
route.map(FAMILYROOM_TIVO_PREFIX + "*", function(eventname, data) {
  livingroom_tivo.exec(eventname.substring(FAMILYROOM_TIVO_PREFIX.length));
});
