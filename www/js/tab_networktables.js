(function() {
    function onValueChanged(key, value, isNew) {
        if (isNew) {
            //console.info('onValueChanged', key, value, isNew);
            var table = '#nt > tbody:last';

            var autoKeys = ["autonomousMode", "robotAutoMode", "switchAttempt", "scaleAttempt", "robotSwitchAttempt", "robotScaleAttempt"];

            if (key.startsWith("/Elevator/")) {
                table = '#elevator_vars > tbody:last';
            }
            if (key.startsWith("/Intake/")) {
                table = '#intake_vars > tbody:last';
            }
            if(key.startsWith("/Drivetrain/")) {
                table = '#drivetrain_vars > tbody:last';
            }

            for (var i = 0; i < autoKeys.length; i++) {
                if (key === "/SmartDashboard/" + autoKeys[i]) {
                    table = '#auto_vars > tbody:last';
                }
            }

            var tr = $('<tr></tr>').appendTo($(table));
            $('<td></td>').text(key).appendTo(tr);
            $('<td></td>').attr('id', NetworkTables.keyToId(key))
                .text(value)
                .appendTo(tr);

        } else {
            $('#' + NetworkTables.keySelector(key)).text(value);

            if (key=== "/SmartDashboard/angle"){
                $("#Compass .arrow").css("transform", "rotate(" + value + "deg)");
                $("#CompassDisplay").text(numeral(value).format("0.00") + " degrees");
            }
            if (key === "/SmartDashboard/shooter_pitch") {
                $("#daShooterArm").css("transform", "rotate(" + (-value) + "deg)");
                $("#daShooterArmDisplay").text(numeral(value).format("0.00") + " degrees");
            }

        }

        if (key === "/SmartDashboard/autonomousOver") {
            autonomousOver();	
        }

        if (key === "/SmartDashboard/driveMode") {
            $("#driveMode").text(value);

        }
    }

    $(function() {
        NetworkTables.addGlobalListener(onValueChanged, true);
    });
})();
