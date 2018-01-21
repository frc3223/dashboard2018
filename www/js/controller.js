$(function drawRect() {
     function getOffsetTopLeft(elt) {
        // see http://javascript.info/tutorial/coordinates
        var box = elt.getBoundingClientRect()
        return { 
            top: box.top + window.pageYOffset, 
            left: box.left + window.pageXOffset
        };
    }

    function pad(x) {
        var s = x + "";
        var n = s.length;
        for(var i = n; i<5; i++) {
            s = "&nbsp;" + s;
        }
        return s;
    }

    var pointHelperHidden = true;
    function displayPointHelper() {
        if(pointHelperHidden) {
            $("#xyreporter").hide();
        }else{
            $("#xyreporter").show();
        }
    }
    displayPointHelper();

    function onMouseMove(_event) {
        var canvas = document.getElementById('controller');
        var origin = getOffsetTopLeft(canvas);
        var raw_x = _event.layerX - Math.floor(origin.left);
        var raw_y = _event.layerY - Math.floor(origin.top);
        var display = "" + pad(raw_x) + " " + pad(raw_y);
        document.getElementById('xyreporter').innerHTML = display; 
    }
    var canvas = document.getElementById("controller");
    canvas.addEventListener('mousemove', onMouseMove);
    document.addEventListener("keydown", function(_evt) {
        if(_evt.key == "p") {
            pointHelperHidden = !pointHelperHidden;
            displayPointHelper();
        }
    });

    var draw = SVG('controller').size("100%", 700);
    var image = draw.image("img/controller.jpg").move(100, 0);

    var left_bumper_text = draw.text("PLACEHOLDER").move(10, 17);
    var left_bumper_line = draw.line(235, 32, 125, 25).stroke({
        color: "skyblue",
        width: 2
    });

	var right_bumper_text = draw.text("PLACEHOLDER").move(560, 17);
    var right_bumper_line = draw.line(435, 32, 550, 25).stroke({
        color: "skyblue",
        width: 2
    });
	
	var left_stick_text = draw.text("lateral motion").move(30, 50);
    var left_stick_line = draw.line(241, 87, 125, 60).stroke({
        color: "skyblue",
        width: 2
    });

    var right_stick_text = draw.text("climber on (press)").move(560, 220);
    var right_stick_line = draw.line(385, 145, 550, 230).stroke({
        color: "skyblue",
        width: 2
    });

    var d_pad_up_text = draw.text("toggle shooter").move(30, 90);
    var d_pad_up_line = draw.line(287, 125, 130, 100).stroke({
        color: "skyblue",
        width: 2
    });

    var d_pad_left_text = draw.text("ball intake in").move(20, 135);
    var d_pad_left_line = draw.line(270, 145, 110, 145).stroke({
        color: "skyblue",
        width: 2
    });
	
	var d_pad_right_text = draw.text("PLACEHOLDER").move(297, 310);
    var d_pad_right_line = draw.line(307, 145, 345, 300).stroke({
        color: "skyblue",
        width: 2
    });
	
	var d_pad_down_text = draw.text("PLACEHOLDER").move(10, 180);
    var d_pad_down_line = draw.line(287, 164, 130, 190).stroke({
        color: "skyblue",
        width: 2
    });
	
	var y_button_text = draw.text("PLACEHOLDER").move(560, 52);
    var y_button_line = draw.line(431, 61, 550, 61).stroke({
        color: "skyblue",
        width: 2
    });
	
	var b_button_text = draw.text("PLACEHOLDER").move(560, 88);
    var b_button_line = draw.line(458, 86, 550, 95).stroke({
        color: "skyblue",
        width: 2
    });
	
	var a_button_text = draw.text("PLACEHOLDER").move(560, 176);
    var a_button_line = draw.line(431, 113, 550, 181).stroke({
        color: "skyblue",
        width: 2
    });
	
	var x_button_text = draw.text("PLACEHOLDER").move(560, 128);
    var x_button_line = draw.line(405, 87, 550, 132).stroke({
        color: "skyblue",
        width: 2
    });

    function togglePressed(elt, isPressed) {
        if (isPressed) {
            elt.fill("red");
        }else {
            elt.fill("black");
        }
    }
    var onValueChanged = function(key, value, isNew) {
        var pressMap = {
            "/SmartDashboard/A Pressed": a_button_text,
            "/SmartDashboard/B Pressed": b_button_text,
            "/SmartDashboard/X Pressed": x_button_text,
            "/SmartDashboard/Y Pressed": y_button_text,
            "/SmartDashboard/Left Bumper Pressed": left_bumper_text,
            "/SmartDashboard/Right Bumper Pressed": right_bumper_text,
            "/SmartDashboard/Right DPAD Pressed": d_pad_right_text,
            "/SmartDashboard/Left DPAD Pressed": d_pad_left_text,
            "/SmartDashboard/Up DPAD Pressed": d_pad_up_text,
            "/SmartDashboard/Down DPAD Pressed": d_pad_down_text,
            "/SmartDashboard/Left Stick Pressed": left_stick_text,
            "/SmartDashboard/Right Stick Pressed": right_stick_text,
        };
        var textMap = {
            "/SmartDashboard/A Text": a_button_text,
            "/SmartDashboard/B Text": b_button_text,
            "/SmartDashboard/X Text": x_button_text,
            "/SmartDashboard/Y Text": y_button_text,
            "/SmartDashboard/Left Bumper Text": left_bumper_text,
            "/SmartDashboard/Right Bumper Text": right_bumper_text,
            "/SmartDashboard/Right DPAD Text": d_pad_right_text,
            "/SmartDashboard/Left DPAD Text": d_pad_left_text,
            "/SmartDashboard/Up DPAD Text": d_pad_up_text,
            "/SmartDashboard/Down DPAD Text": d_pad_down_text,
            "/SmartDashboard/Left Stick Text": left_stick_text,
            "/SmartDashboard/Right Stick Text": right_stick_text,
        };
        if(key in pressMap) {
            togglePressed(pressMap[key], value);
        }
        if(key in textMap) {
            var textElement = textMap[key];
            textElement.text(value);
        }
    }

    NetworkTables.addGlobalListener(onValueChanged, true);
});
