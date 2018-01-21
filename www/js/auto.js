var autonomousMode = null;
var autonomousModeLabel = "/SmartDashboard/autonomousMode";
var websocketConnected = false;

$(function() {
    NetworkTables.addWsConnectionListener(autoWebSocketConnectionListener, true);
    NetworkTables.addRobotConnectionListener(autoRobotConnectionListener, true);
    NetworkTables.addGlobalListener(autoListener, true);
    // update autonomousMode on user input
    $(".auto-option input[name='autochoice']").change(function() {
        autonomousMode = $(this).val();
        showSelectedAutonomousOption();
        console.info("auto: ", $(this), autonomousMode);
        sendAutonomousMode();
    });

    setInterval(syncAutonomousMode, 200);
});

// this will be connected when the dashboard server is connected,
// and the robot is connected
function autoWebSocketConnectionListener(connected) {
    websocketConnected = connected;
    console.info("websocket connection", connected);
}

function showSelectedAutonomousOption() {
    $(".auto-option")
        .removeClass("selected-option");
    $(".auto-option input[value='" + autonomousMode + "']")
        .parents()
        .filter(".auto-option")
        .addClass("selected-option");
}

// this does not fire the change event, apparently
function selectAutonomousOption() {
    $(".auto-option input[value='"+ autonomousMode +"']").prop('checked', true);
    showSelectedAutonomousOption();
}

// send autonomous mode to robot
function sendAutonomousMode() {
    if(autonomousMode != null) {
        console.info("sending auto mode ", autonomousMode);
        NetworkTables.putValue(autonomousModeLabel, 
                autonomousMode); 
    } else {
        console.info("not sending auto mode ", autonomousMode);
    }
}

// when robot connects, send autonomousMode. make sure robot gets it.
function autoRobotConnectionListener(connected) {
    if(connected) {
        sendAutonomousMode();
    }
}

// when dashboard connects the first time, a value may exist in 
// the distributed hash table. if it does, we might get notified of it here.
// it might take a few seconds.
// if we do, accept it and set the appropriate control in the UI so that
// the user can see what the robot thinks its autonomous routine is
function autoListener(key, value, isNew) {
    if(key === autonomousModeLabel) {
        autonomousMode = value;
        selectAutonomousOption();
    }
    if(key === "/SmartDashboard/javaAutoMode") {
        $("#javaAutoMode").text(value);
    }
}

// when dashboard connects, robot connects, user selects option, then option 
// is selected. then let dashboard server die, let robot disconnect, then 
// distributed hash table is deleted (i think) but option is still displayed to 
// user when it actually isn't what the robot thinks is the mode
// so how about instead we have a periodic checker that pushes the value of 
// autonomousMode to the UI and to network tables as needed.

function syncAutonomousMode() {
    if(autonomousMode != null) {
        selectAutonomousOption();
        if(websocketConnected) {
            if(NetworkTables.containsKey(autonomousModeLabel)) {
                var value = NetworkTables.getValue(autonomousModeLabel);
                if(value != autonomousMode) {
                    sendAutonomousMode();
                }
            }else{
                sendAutonomousMode();
            }
        }
    }
}
