var selectedData = einheitskrankenkasse;

document.getElementById('data-selection').addEventListener('change', function(event) {
    selectedData = eval(event.currentTarget.value);
    fillCantons();
});

var width = 960, height = 600;

var projection = d3.geo.albers()
    .rotate([0, 0])
    .center([8.3, 46.8])
    .scale(16000)
    .translate([width / 2, height / 2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

// insert svg element
var svg = d3.select("main").append("svg")
    .attr("width", width)
    .attr("height", height);

// draw switzerland
svg.append("path")
    .datum(cantons)
    .attr("class", "switzerland")
    .attr("d", path);

// draw boundaryies
svg.append("path")
    .datum(topojson.mesh(swiss, swiss.objects.cantons, function(a, b) { return a !== b; }))
    .attr("class", "canton-boundary")
    .attr("d", path);

// fill the cantons
var cantons = topojson.feature(swiss, swiss.objects.cantons).features;

fillCantons();
addTooltips();

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// fills the cantons with red or green, depending on the results.
function fillCantons() {
    svg.selectAll(".canton").remove();
    svg.selectAll(".canton")
        .data(cantons)
        .enter().insert("path", ".canton-boundary")
        .attr("class", "canton")
        .attr("d", path)
        .style("fill", function(d, i) {
            var data = getData(d.id);

            var totalVotes = data.yes + data.no;

            var baseColor = (data.yes > data.no) ? "#10A123" : "#BF0202";

            var color = (data.yes > data.no) ? shadeColor2(baseColor, data.yes/totalVotes*0.8) : shadeColor2(baseColor, 1-data.no/totalVotes*0.8);
            return color;
        });
}

function addTooltips() {
    svg.selectAll(".canton")
        .on("mouseover", function(d, i) {
            div.transition()
                .duration(200)
                .style("opacity", .9);

            var data = getData(d.id);


            var totalVotes = data.yes + data.no;

            var percentageYes = ((data.yes/totalVotes)*100);
            var percentageNo = ((data.no/totalVotes)*100);

            div .html(data.canton + "<br/>Yes: " + percentageYes.toFixed(2) + "% (" + data.yes + ")<br/>No: " + percentageNo.toFixed(2) + "% (" + data.no + ")" )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

// gets the data for a specific canton.
function getData(canton) {
    var data = selectedData.results.filter(function(element){
        if(element.canton == canton) {
            return element;
        }
    });
    return data[0];
}

// Source: http://stackoverflow.com/revisions/13542669/10
function shadeColor2(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
