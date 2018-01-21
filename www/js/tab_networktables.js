(function() {
    function onValueChanged(key, value, isNew) {
        if (isNew) {
            //console.info('onValueChanged', key, value, isNew);
            var table = '#nt > tbody:last';

            var autoKeys = ["autonomousMode", "javaAutoMode"];

            var sensorKeys = [ 
                "seesHighGoal", "xOffsetHighGoal", "zOffsetHighGoal", 
                "thetaHighGoal", "Sees Lift", "xOffset Lift",
                "seesLift", "xOffsetLift", "zOffsetLift", "thetaLift", "psiLift"
            ];


            var parameterKeys = [];

            var joystickKeys = [];
            for (var i = 0; i < joystickKeys.length; i++) {
                for (var j = 0; j <= 12; j++) {
                    if (key === "/SmartDashboard/" + joystickKeys[i] + j) {
                        table = '#joystick_vars > tbody:last';
                    }
                }
            }

            for (var i = 0; i < sensorKeys.length; i++) {
                if (key === "/SmartDashboard/" + sensorKeys[i]) {
                    table = '#sensor_vars > tbody:last';
                }
            }

            for (var i = 0; i < autoKeys.length; i++) {
                if (key === "/SmartDashboard/" + autoKeys[i]) {
                    table = '#auto_vars > tbody:last';
                }
            }

            for (var i = 0; i < parameterKeys.length; i++) {
                if (key === "/SmartDashboard/" + parameterKeys[i]) {
                    table = '#parameter_vars > tbody:last';
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
