/*global countlyCommon,countlyEvent,d3,jQuery */
(function(treemapPlugin, $) {

    var _treemapData = {};    

    treemapPlugin.initialize = function() {

    };

    treemapPlugin.fetchTreemapData = function(levels) {

        var data = {
            "app_id": countlyCommon.ACTIVE_APP_ID,
        };
        levels.forEach((prop,i) => { data['level'+(i+1)] = prop; });
        console.log("fetchTreemapData", levels, data);
        return $.ajax({
            type: "GET",
            url: countlyCommon.API_URL + "/o/treemap",
            data: data,
            success: function(json) {
                _treemapData = json;
                console.log("treemap data fetched", json);
            }
        });
    };

    treemapPlugin.fetchAllEvents = function() {
        return $.when(countlyEvent.initialize(true)).then(function() {
            _eventsList = countlyEvent.getEvents().map(function(data) {
                return data.key;
            });
        });
    };

    treemapPlugin.getTreemapData = function() {
        return _treemapData;
    };

    treemapPlugin.getEventsList = function() { 
        return _eventsList;
    };

    treemapPlugin.loadTreemap = function(levels) {
        $.when(this.fetchTreemapData(levels)).then(root => {
            console.log("loadTreemap", root);
            this.updateChart(root);
        });
    }
    
    treemapPlugin.updateChart = function(root) {
        var chartAreaWidth = $('#chart').width() - 50;
        chartAreaWidth = chartAreaWidth > 972 ? 972 : chartAreaWidth;
        var chartAreaHeight = chartAreaWidth * 0.35;
        var margin = { top: 20, right: 10, bottom: 10, left: 10 };
        var width = chartAreaWidth - margin.left - margin.right;
        var height = chartAreaHeight - margin.top - margin.bottom;
        var padding = 3;
        var xLabelHeight = 30;
        var yLabelWidth = 80;
        var borderWidth = 1;
        var duration = 0;

        var treemap = d3.layout.treemap()
        treemap
          .size([width, height])
          .sticky(true)
          .padding(15);

        var color = d3.scale.category10();

        var div = d3.select("#chart").append("div")
                    .style("position", "relative")
                    .style("width", (width + margin.left + margin.right) + "px")
                    .style("height", (height + margin.top + margin.bottom) + "px")
                    .style("left", margin.left + "px")
                    .style("top", margin.top + "px");

        var nodes = div.datum(root).selectAll(".node")
            .data(treemap.nodes)
          .enter().append("div")
            .attr("class", "node")
            .call(position)
            .style("background", function(d,i) { return d.children ? color(i) : null; })
            .text(function(d) { return d.depth == 0 ? null : d.name; });

        nodes
            .data(treemap.nodes)
          .transition()
            .duration(1500)
            .call(position);

        function position() {
              this.style("left", function(d) { return d.x + "px"; })
                  .style("top", function(d) { return d.y + "px"; })
                  .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
                  .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
        }

        d3.selectAll('.node').on('mouseover',function(){
          d3.select(this).style('box-shadow','3px 0px 30px #fff');
        });
        d3.selectAll('.node').on('mouseout',function(){
          d3.select(this).style('box-shadow','none');
        });
    };        
}(window.treemapPlugin = window.treemapPlugin || {}, jQuery));
