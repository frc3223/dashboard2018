
(function () {

    function onRobotConnection(connected) {
        if(connected) {
            $(".robot-connection-warning").hide();
        }else{
            $(".robot-connection-warning").show();
        }
    }

    function onNetworkTablesConnection(connected) {
        if (connected) {
            $("#nt tbody > tr").remove();
            $(".connection-warning").hide();
        } else {
            $(".connection-warning").show();
        }
    }

    $(function() {
        NetworkTables.addWsConnectionListener(onNetworkTablesConnection, true);
        NetworkTables.addRobotConnectionListener(onRobotConnection, true);
    });
})();
