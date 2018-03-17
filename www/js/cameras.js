
function CscoreCamera(args) {
    this.url = args.url;
    this.selector = args.selector;
    this.noSignal = args.noSignal;
    var camera = this;
    camera.lastFailed = false;
    camera.setStream();
    setInterval(function() {
        $.ajax({
            url: camera.url + "/settings.json",
            dataType: 'json',
            error: function(errorResponse) {
                camera.lastFailed = true;
                camera.setStream(camera.noSignal);
            },
            success: function() {
                if(camera.lastFailed) {
                    camera.setStream();
                    camera.lastFailed = false;
                }
            }
        });
    }, 1000);
}

CscoreCamera.prototype.getImg = function() {
    return $(this.selector + " img:first");
}

CscoreCamera.prototype.setStream = function(src) {
    if(src == null) {
        var timestamp = (new Date()).getTime();
        src = this.url + "/stream.mjpg?a="+timestamp;
        this.getImg().removeClass("no-signal");
        this.getImg().addClass("signal");
    }else{
        this.getImg().removeClass("signal");
        this.getImg().addClass("no-signal");
    }
    this.getImg().attr('src', src);
}

var rio_url = "http://10.32.23.2";

var frontCamera;
var altCamera;

$(function () {
    var frontIsDisplayed = true;
    frontCamera = new CscoreCamera({
		url: rio_url + ":1181",
        selector: "#webcam0_stream",
        noSignal: "/img/indianfront.png"
    });

    altCamera = new CscoreCamera({
        url: rio_url + ":1182",
        selector: "#webcam1_stream",
        noSignal: "/img/indianfront.png"
    });

    $("#webcam0_stream, #webcam1_stream").click(function() {
        if(frontIsDisplayed) {
            $("#webcam0_stream").hide();
            $("#webcam1_stream").show();
            frontIsDisplayed = false;
        }else{
            $("#webcam0_stream").show();
            $("#webcam1_stream").hide();
            frontIsDisplayed = true;
        }
    });

});
