
function CameraFrame(obj) {
    this.selector = obj.selector;
    this.noSignal = obj.noSignal;
    this.lastLoaded = 0;
    this.state = "no-signal";
    this.imageNr = 0;
    this.finished = [];
    this.lastTried = Date.now();
    this.camera = null;
    var frame = this;

    $(function() {
        frame.hideStream();
        setInterval(function() {
            var now = Date.now();
            if (frame.state === "signal" && (now - frame.lastLoaded) >= 5000 && !frame.camera.singleImage) {
                frame.state = "no-signal";
                frame.hideStream();
            }
            if (frame.state === "no-signal" && 
                    (now - frame.lastTried) >= 5000 &&
                frame.camera != null &&
                !frame.camera.singleImage) {
                frame.lastTried = Date.now();
                frame.createImageLayer();
            }
        }, 1000);
    });
}

CameraFrame.prototype.getSignalImg = function() {
    return $(this.selector + " .signal");
};

CameraFrame.prototype.getNoSignalImg = function() {
    return $(this.selector + " .no-signal");
};

CameraFrame.prototype.showStream = function() {
    this.getSignalImg().show();
    this.getNoSignalImg().hide();
};

CameraFrame.prototype.hideStream = function() {
    this.getSignalImg().hide();
    this.getNoSignalImg().show();
};

CameraFrame.prototype.clear = function() {
    this.getSignalImg().remove();
    this.finished = [];
};

CameraFrame.prototype.setCamera = function(camera) {
    this.camera = camera;
    this.clear();
    this.showStream();
    this.createImageLayer();
};

CameraFrame.prototype.cycleCamera = function() {
	this.setCamera(this.camera.nextCamera);
};

CameraFrame.prototype.createImageLayer = function() {
    var frame = this;
    var img = new Image();
    img.style.zIndex = -1;
    img.onload = function() {
        frame.showStream();
        frame.imageOnload(this);
    };
    img.onerror = function() {
        frame.hideStream();
    }
    img.src = this.camera.url + "&n=" + (++this.imageNr);
    $(img).addClass("signal")
    var webcam = $(this.selector);
    webcam.get(0).insertBefore(img, webcam.firstChild);
};

CameraFrame.prototype.imageOnload = function(img) {
    var frame = this;
    frame.showStream();
    frame.lastLoaded = Date.now();
    frame.state = "signal";
    img.style.zIndex = frame.imageNr;
    while (1 < frame.finished.length) {
        var del = frame.finished.shift();
        del.parentNode.removeChild(del);
    }
    frame.finished.push(img);
    if(!frame.paused && !frame.camera.singleImage) {
        setTimeout(function() {
            frame.createImageLayer();
        }, 100);
    }
};

function Camera(args) {
    this.url = args.url;
    this.singleImage = args.singleImage;
    this.elt = $("#" + this.eltId);
    this.elt.html("<noscript><img src='" + this.url + "'/></noscript>");
}

var frameL = new CameraFrame({
    selector: "#webcam0_stream",
    noSignal: "/img/indianfront.png"
});

var frameR = new CameraFrame({
    selector: "#webcam1_stream",
    noSignal: "/img/indianback.png",
});

var piurl = "http://marschmahlo";
var rio_url = "http://roborio-3223-frc.local";

var frontCamera;

var altCamera;

var structureCamera;

var nullCamera;

var structureMode = 8;

function initCameras() {
    frontCamera = new Camera({
        //url: rio_url + ":5800/?action=snapshot",
		url: piurl + ":5803/?action=snapshot",
		singleImage: false,
        nextCamera: null
    });

    altCamera = new Camera({
        url: piurl + ":5800/?action=snapshot",
        singleImage: false,
        nextCamera: null
    });

    structureCamera = new Camera({
        url: piurl + ":5802/?action=snapshot",
        singleImage: false,
        nextCamera: null
    });

    nullCamera = new Camera({
        url: "/img/indianfront.png",
        singleImage: true,
        nextCamera: null
    });

	frontCamera.nextCamera = altCamera;
	altCamera.nextCamera = structureCamera;
	structureCamera.nextCamera = nullCamera;
	nullCamera.nextCamera = frontCamera;
    frameL.setCamera(frontCamera);
    frameR.setCamera(altCamera);
    $("#rightStructureModeContainer").hide();
    $("#leftStructureModeContainer").hide();

   $("#rightFrameCamera").change(function(){
   	var value = $("#rightFrameCamera").val();
   	if (value == "front") {
            frameR.setCamera(frontCamera);
   	} else if (value == "back") {
            frameR.setCamera(altCamera);
   	} else if (value == "structure") {
            frameR.setCamera(structureCamera);
   	}else if(value == "none") {
            frameR.setCamera(nullCamera);
        }

        if(value == "structure") {
            $("#rightStructureModeContainer").show();
        }else{
            $("#rightStructureModeContainer").hide();
        }
   });
   
   $("#webcam1_stream").click(function() {
	   frameR.cycleCamera();
	   syncCameraDropdown(frameR, $("#rightFrameCamera"));
   });
   $("#webcam0_stream").click(function() {
	   frameL.cycleCamera();
	   
	   syncCameraDropdown(frameL, $("#leftFrameCamera"));
   });
   
   $("#leftFrameCamera").change(function(){
   	var value = $("#leftFrameCamera").val();
   	if (value == "front") {
            frameL.setCamera(frontCamera);
   	} else if (value == "back") {
            frameL.setCamera(altCamera);
   	} else if (value == "structure") {
            frameL.setCamera(structureCamera);  	
        } else if (value == "none") {
            frameL.setCamera(nullCamera);
   	}

        if(value == "structure") {
            $("#leftStructureModeContainer").show();
        }else{
            $("#leftStructureModeContainer").hide();
        }
   });

   $("#leftStructureMode").change(function() {
       var value = parseInt($("#leftStructureMode").val());
       if(!isNaN(value)) {
           structureMode = value;
       }
       NetworkTables.putValue("/SmartDashboard/structureMode", structureMode);
   });
   $("#rightStructureMode").change(function() {
       var value = parseInt($("#rightStructureMode").val());
       if(!isNaN(value)) {
           structureMode = value;
       }
       NetworkTables.putValue("/SmartDashboard/structureMode", structureMode);
   });
}

$(function() {
    $.ajax({
        url: "/piurl", 
        success: function(response) {
			console.info("repno", response);
			response = JSON.parse(response);
            piurl = response.pi;
			rio_url = response.rio;
			console.info("rio: ", rio_url);
			console.info("piurl:" , piurl);
            initCameras();
        },
        error: function(errorResponse) {
            initCameras();
        }
    });
});


function syncCameraDropdown(cameraFrame, dropdown) {
	if(cameraFrame.camera == frontCamera) {
		dropdown.val("front");
	}else if(cameraFrame.camera == altCamera) {
		dropdown.val("back");
	}else if(cameraFrame.camera == structureCamera) {
		dropdown.val("structure");
	}else if(cameraFrame.camera == nullCamera) {
		dropdown.val("none");
	}
}
