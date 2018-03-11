var autonomousMode = null;
var switchAttempt = true;
var scaleAttempt = false;
var autonomousModeLabel = "SmartDashboard/autonomousMode";
var switchAttemptLabel = "SmartDashboard/switchAttempt"
var scaleAttemptLabel = "SmartDashboard/scaleAttempt"
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
    $(".auto-option input[name='Switch']").change(function() {
        switchAttempt = $(this).prop("checked");
        console.info("switch attempt: ", $(this), switchAttempt);
        sendSwitchAttempt();
    });
    $(".auto-option input[name='Scale']").change(function() {
        scaleAttempt = $(this).prop("checked");
            console.info("scale attempt: ", $(this), scaleAttempt);
        sendScaleAttempt();
    });

    setInterval(syncAutonomousMode, 800);
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

// this does not fire the change event either
function selectSwitchAttempt() {
    $(".auto-option input[name='Switch']").prop("checked", switchAttempt);
}

// this does not fire the change event either
function selectScaleAttempt() {
    $(".auto-option input[name='Scale']").prop("checked", scaleAttempt);
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

function sendScaleAttempt() {
    if(scaleAttempt != null) {
        console.info("sending scale attempt ", scaleAttempt);
        NetworkTables.putValue(scaleAttemptLabel, 
                scaleAttempt);
    }
}

function sendSwitchAttempt() {
    if(switchAttempt != null) {
        console.info("sending switch attempt ", switchAttempt);
        NetworkTables.putValue(switchAttemptLabel, 
                switchAttempt);
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
    if(key === "/SmartDashboard/robotAutoMode") {
        $("#robotAutoMode").text(value);
    }
    if(key === "/SmartDashboard/robotSwitchAttempt") {
        $("#robotSwitchAttempt").text(value);
    }
    if(key === "/SmartDashboard/robotScaleAttempt") {
        $("#robotScaleAttempt").text(value);
    }
}

// when dashboard connects, robot connects, user selects option, then option 
// is selected. then let dashboard server die, let robot disconnect, then 
// distributed hash table is deleted (i think) but option is still displayed to 
// user when it actually isn't what the robot thinks is the mode
// so how about instead we have a periodic checker that pushes the value of 
// autonomousMode to the UI and to network tables as needed.

function syncAutonomousMode() {
    ensureSent(autonomousModeLabel, autonomousMode, selectAutonomousOption, sendAutonomousMode);
    ensureSent(switchAttemptLabel, switchAttempt, selectSwitchAttempt, sendSwitchAttempt);
    ensureSent(scaleAttemptLabel, scaleAttempt, selectScaleAttempt, sendScaleAttempt);
}

function ensureSent(label, local_value, selector, sender) {
    if(local_value != null) {
        selector();
        if(websocketConnected) {
            if(NetworkTables.containsKey(label)) {
                var value = NetworkTables.getValue(label);
                if(value != local_value) {
                    sender();
                }
            }else{
                sender();
            }
        }
    }
}
