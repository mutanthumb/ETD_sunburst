
    // Define the dimensions of the visualization.
    var margin = {top: 30, right: 10, bottom: 20, left: 10},
        width = 960 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom,
        radius = Math.min(width, height) / 2;

    // Create the SVG container for the visualization and
    // define its dimensions. Within that container, add a
    // group element (`<g>`) that can be transformed via
    // a translation to account for the margins and to
    // center the visualization in the container.
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" +
                (margin.left + width  / 2) + "," +
                (margin.top  + height / 2) + ")");

    // Define the scales that will translate data values
    // into visualization properties. The "x" scale
    // will represent angular position within the
    // visualization, so it ranges lnearly from 0 to
    // 2π. The "y" scale will reprent area, so it
    // ranges from 0 to the full radius of the
    // visualization. Since area varies as the square
    // of the radius, this scale takes the square
    // root of the input domain before mapping to
    // the output range.
    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);
    var y = d3.scale.sqrt()
        .range([0, radius]);

    // Define the function that creates a partition
    // layout from the dataset. Because we're using
    // `d3.nest` to construct the input dataset, the
    // children array will be stored in the `values`
    // property unless the node is a leaf node. In
    // that case the `values` property will hold
    // the data value itself.
    var partition = d3.layout.partition()
        .children(function(d) {
            return Array.isArray(d.values) ?
                d.values : null;
        })
        .value(function(d) {
            return d.values;
          })
          .sort(function(d) { //This little nugget allows the sunburst to be
                              // sorted by Year rather than by value
              return;
          });

          var legendColors = {
              "Letters & Science": "#1f77b4",
              "Agriculture": "#ff7f0e",
              "Arts and Architecture": "#9467bd",
              "Business": "#7f7f7f",
              "Educ., Health & Human Dev": "#d62728",
              "Engineering": "#2ca02c",
              "Nursing": "#e377c2",
              "Graduate School": "#8c564b"
          };

    // Define a function that returns the color
    // for a data point. The input parameter
    // should be a data point as defined/created
    // by the partition layout.
    var color = function(d) {

        // This function builds the total
        // color palette incrementally so
        // we don't have to iterate through
        // the entire data structure.

        // We're going to need a color scale.
        // Normally we'll distribute the colors
        // in the scale to child nodes.
        var colors;

        // The root node is special since
        // we have to seed it with our
        // desired palette.
        if (!d.parent) {

            // Create a categorical color
            // scale to use both for the
            // root node's immediate
            // children. We're using the
            // 10-color predefined scale,
            // so set the domain to be
            // [0, ... 9] to ensure that
            // we can predictably generate
            // correct individual colors.
            colors = d3.scale.category10()
                .domain(d3.range(0,10));

            // White for the root node
            // itself.
            d.color = "#fff";

        } else if (d.children) {

            // Since this isn't the root node,
            // we construct the scale from the
            // node's assigned color. Our scale
            // will range from darker than the
            // node's color to brigher than the
            // node's color.
            var startColor = d3.hcl(d.color)
                                .darker(),
                endColor   = d3.hcl(d.color)
                                .brighter();

            // Create the scale
            colors = d3.scale.linear()
                    .interpolate(d3.interpolateHcl)
                    .range([
                        startColor.toString(),
                        endColor.toString()
                    ])
                    .domain([0,d.children.length+1]);

        }

        if (d.children) {

            // Now distribute those colors to
            // the child nodes. We want to do
            // it in sorted order, so we'll
            // have to calculate that. Because
            // JavaScript sorts arrays in place,
            // we use a mapped version.
            d.children.map(function(child, i) {
                return {value: child.value, idx: i};
            }).sort(function(a,b) {
                return b.value - a.value
            }).forEach(function(child, i) {
                d.children[child.idx].color = colors(i);
            });
        }

        return d.color;
    };

    // Define the function that constructs the
    // path for an arc corresponding to a data
    // value.
    var arc = d3.svg.arc()
        .startAngle(function(d) {
            return Math.max(0,
                Math.min(2 * Math.PI, x(d.x)));
        })
        .endAngle(function(d) {
            return Math.max(0,
                Math.min(2 * Math.PI, x(d.x + d.dx)));
        })
        .innerRadius(function(d) {
            return Math.max(0, y(d.y));
        })
        .outerRadius(function(d) {
            return Math.max(0, y(d.y + d.dy));
        });

        // Retrieve the raw data as a TSV file.
        d3.tsv("etds.tsv", function(error, dataset) {
            var hierarchy = {
                key: "ETD",
                values: d3.nest()
                    .key(function(d) { return d.college; }).sortKeys(d3.ascending)
                    .key(function(d) { return d.dept; }).sortKeys(d3.ascending)
                    .key(function(d) { return d.year; }).sortKeys(d3.ascending)
          .rollup(function(leaves) {
                        return leaves.length;
                    })
                    .entries(dataset)
            };

        // Construct the visualization.
        var path = svg.selectAll("path")
            .data(partition.nodes(hierarchy))
          .enter().append("path")
            .attr("d", arc)
            .attr("stroke", "#fff")
            .attr("fill-rule", "evenodd")
            .attr("fill", color)
            .on("click", click)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        // Add a container for the tooltip.


        // Add the title.
        svg.append("text")
            .attr("font-size", 16)
            .attr("fill", "#000")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + 0 + "," + (-10 -height/2)  +")")
            .text("Montana State University - Electronic Theses and Dissertations");

        svg.append("image")
            .attr("xlink:href", "scholarWorksDark.png")
            .attr("x", -80)
            .attr("y", -150)
            .attr("width", "150")
            .attr("height", "150");

        svg.append("text")
                //.on("click",click)
                .attr("class","center-text")
                .attr("x", -115)
                      .attr("y", 90)
                .style("font-size",16)
                //.style("font-weight","bold")
                .html("Click to explore our " +  hierarchy.value + " ETDs");

        // Handle clicks on data points. All
        // we need to do is start the transition
        // that updates the paths of the arcs.
        function click(d) {
          if (d.depth == 3) { // This goes directly to the "year" in Scholarworks
            var urlYear1 = "http://scholarworks.montana.edu/xmlui/handle/1/733/discover?filtertype_1=dateIssued&filter_relational_operator_1=equals&filter_1=";
            var urlYear2 = "&filtertype_2=department&filter_relational_operator_2=equals&filter_2=";
              if (d.parent.key.match(/&/g)) {
                var dept = d.parent.key.replace(/ /g,"+");
                var dept = d.parent.key.replace(/&/g,"%26");
                var url =  urlYear1 + d.key + urlYear2 + dept;
                } else if (d.parent.key.match(/\s/g)) {
                var dept = d.parent.key.replace(/ /g,"+");
                var url =  urlYear1 + d.key + urlYear2 + dept;
                } else {
                var url =  urlYear1 + d.key + urlYear2 + d.parent.key;
                }
                window.location = url;
              }
            else {
              path.transition()
                  .duration(750)
                  .attrTween("d", arcTween(d));
              // Hide the tooltip since the
              // path "underneath" the cursor
              // will likely have changed.
              if(d.key !== "ETD"){
              svg.select(".center-text")
              .style("display","none")
            } else {
              svg.select(".center-text")
               .style("display","")
          }
            }
            mouseout();
        };


        // Handle mouse moving over a data point
        // by enabling the tooltip.
        function mouseover(d) {
          if (d.depth == 0) {
            d3.select("#tooltip").classed("hidden",true);
          }
          else if (d.depth == 1) { // College
            //Update the tooltip position and value
            d3.select("#tooltip")
              .html(d.key + "<br/><br/>"  + d.value + " ETDs")
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY) + "px")
              .transition()
                  .duration(500)
                  .style("opacity", 0)
              .transition()
                  .duration(200)
                  .style("opacity", .9)
              //.attr("fill-opacity", 1);
            //Show the tooltip
            d3.select("#tooltip").classed("hidden",false);
              }
          else if (d.depth == 2) { // Department
               var urlDept1 = "http://scholarworks.montana.edu/xmlui/handle/1/733/browse?value=";
                   var urlDept2 = "&type=department";
                     if (d.key.match(/&/g)) {
                       var dept = d.key.replace(/ /g,"+");
                       var dept = d.key.replace(/&/g,"%26");
                       var url =  urlDept1 + dept + urlDept2;
               } else if (d.key.match(/\s/g)) {
                       var dept = d.key.replace(/ /g,"+");
                       var url =  urlDept1 + dept + urlDept2;
                     } else {
                     var url =  urlDept1 + d.key + urlDept2;
                     }
                     //Update the tooltip position and value
                     d3.select("#tooltip")
                   .html("<a href=\"" + url + "\">"  + d.key + "</a> <br/><br/>" + d.value + " ETDs")
                     .style("left", (d3.event.pageX) + "px")
                     .style("top", (d3.event.pageY) + "px")
                     .transition()
                         .duration(500)
                         .style("opacity", 0)
                     .transition()
                         .duration(200)
                         .style("opacity", .9)
                     //.attr("fill-opacity", 1);
                   //Show the tooltip
                   d3.select("#tooltip").classed("hidden",false);
                   }

          else if (d.depth == 3){ //Year
                 var urlYear1 = "http://scholarworks.montana.edu/xmlui/handle/1/733/discover?filtertype_1=dateIssued&filter_relational_operator_1=equals&filter_1=";
                 var urlYear2 = "&filtertype_2=department&filter_relational_operator_2=equals&filter_2=";
                   if (d.parent.key.match(/&/g)) {
                     var dept = d.parent.key.replace(/ /g,"+");
                     var dept = d.parent.key.replace(/&/g,"%26");
                     var url =  urlYear1 + d.key + urlYear2 + dept;
                     } else if (d.parent.key.match(/\s/g)) {
                     var dept = d.parent.key.replace(/ /g,"+");
                     var url =  urlYear1 + d.key + urlYear2 + dept;
                     } else {
                     var url =  urlYear1 + d.key + urlYear2 + d.parent.key;
                     }
                     //Update the tooltip position and value
                     d3.select("#tooltip")
                   .html("<a href=\"" + url + "\">"  + d.key + "</a> <br/><br/>" + d.value + " ETDs")
                     .style("left", (d3.event.pageX) + "px")
                     .style("top", (d3.event.pageY) + "px")
                     .transition()
                         .duration(500)
                         .style("opacity", 0)
                     .transition()
                         .duration(200)
                         .style("opacity", .9)
                     //.attr("fill-opacity", 1);
                   //Show the tooltip
                   d3.select("#tooltip").classed("hidden",false);
                   }

        };

        // Handle mouse leaving a data point
        // by disabling the tooltip.
        function mouseout() { //Makes it difficult to click on the link if enabled
          //Hide the tooltip
            //d3.select("#tooltip").classed("hidden",true);
        };

    });

    // Function to interpolate values for
    // the visualization elements during
    // a transition.
    function arcTween(d) {
        var xd = d3.interpolate(x.domain(),
                    [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(),
                    [d.y, 1]),
            yr = d3.interpolate(y.range(),
                    [d.y ? 20 : 0, radius]);
        return function(d, i) {
            return i ?
                function(t) {
                    return arc(d);
                } :
                function(t) {
                    x.domain(xd(t));
                    y.domain(yd(t)).range(yr(t));
                    return arc(d);
                };
        };
    }
