var kpbs_line = new TimeSeries();
var reads_line = new TimeSeries();

$(function(){
var kpbs = new SmoothieChart();
kpbs.streamTo(document.getElementById("usage_client_dashboard_kpbs"), 1000);
kpbs.addTimeSeries(kpbs_line);

var reads = new SmoothieChart();
reads.streamTo(document.getElementById("usage_client_dashboard_reads"), 1000);
reads.addTimeSeries(reads_line);

});

function onValueChanged(key, value, isNew) {
	console.info(key, value);
	if (key.startsWith("/SmartDashboard/XAccel")) {
		kpbs.append(new Date().getTime(), value);
	} else if (key.startsWith("/SmartDashboard/YAccel")) {
		reads.append(new Date().getTime(), value);
	}
}

$(function(){
    NetworkTables.addGlobalListener(onValueChanged, true);
});
