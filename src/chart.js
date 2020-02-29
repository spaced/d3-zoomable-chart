//import d3 from "d3/d3";
// 2. Use the margin convention practice
//import d3 from "./d3/d3";


const margin = {top: 50, right: 50, bottom: 50, left: 50}
  , width = window.innerWidth - margin.left - margin.right // Use the window's width
  , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height


// 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
d3.csv("exp.csv").then(dataset => {
  dataset.forEach(d => {d.date=new Date(d.date)});
  // The number of datapoints

  // 5. X scale will use the index of our data
  const xScale = d3.scaleUtc()
    .domain(d3.extent(dataset, d => d.date))
    .range([0, width - margin.right]);

  // 6. Y scale will use the randomly generate number
  const yScale = d3.scaleLinear()
    .domain([0, 50]) // input
    .range([height, 0]); // output

  // 7. d3's line generator


  const zoom = d3.zoom()
    .scaleExtent([1, 32])
    .extent([[margin.left, 0], [width - margin.right, height]])
    .translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]])
    .on("zoom", zoomed);

  // 1. Add the SVG to the page and employ #2
  const svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(zoom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append('defs')
    .append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height);

  const xAxis=d3.axisBottom(xScale).ticks(5);
  const yAxis=d3.axisLeft(yScale).ticks(5);
  const innerHeight=height;
  const innerWidth=width - margin.right;
  const xAxisGrid = d3.axisBottom(xScale).tickSize(-innerHeight).tickFormat('').ticks(10);
  const yAxisGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat('').ticks(10);
  // var view = svg.append("rect")
  //   .attr("class", "view")
  //   .attr("x", margin.left)
  //   .attr("y", margin.top)
  //   .attr("width", width - 1)
  //   .attr("height", height - 1);

  // 3. Call the x axis in a group tag
  const gX = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis); // Create an axis component with d3.axisBottom

  // 4. Call the y axis in a group tag
  const gY = svg.append("g")
    .attr("class", "y axis")
    .call(yAxis); // Create an axis component with d3.axisLeft

  const gridX=svg.append('g')
    .attr('class', 'grid')
    .attr('transform', 'translate(0,' + innerHeight + ')')
    .call(xAxisGrid);

  const gridY=svg.append('g')
     .attr('class', 'grid')
     .call(yAxisGrid);
  // Create axes.

  // 9. Append the path, bind the data, and call the line generator

  const charts=svg.append("g")
    .attr("class","charts")
    .attr('clip-path', 'url(#clip)');
  // charts.append("clipPath")
  //   .attr("id", clip.id)
  //   .append("rect")
  //   .attr("x", margin.left)
  //   .attr("y", margin.top)
  //   .attr("width", width - margin.left - margin.right)
  //   .attr("height", height - margin.top - margin.bottom);

  function lineFor(g, c,dFn) {
    const line = d3.line()
      .x(function(d) { return xScale(d.date); }) // set the x values for the line generator
      .y(function(d) { return yScale(dFn(d)); }) // set the y values for the line generator
      .curve(d3.curveMonotoneX) // apply smoothing to the line

    g.append("path")
      .datum(dataset) // 10. Binds data to the line
      .attr("class", "line line-"+c) // Assign a class for styling
      .attr("d", line); // 11. Calls the line generator
    // 12. Appends a circle for each datapoint
    g.selectAll(".dot"+c)
      .data(dataset)
      .enter().append("circle") // Uses the enter().append() method
      .attr("class", "dot dot"+c) // Assign a class for styling
      .attr("cx", function (d) { return xScale(d.date) })
      .attr("cy", function (d) { return yScale(dFn(d)) })
      .attr("r", 3)
      .on("mouseover", function (a, b, c) {
        console.log(a)
        this.attr('class', 'focus')
      })
      .on("mouseout", function () { });

  }
  const g1 = charts.append("g")
    .attr("class","charts-g1");
  const g2 = charts.append("g")
    .attr("class","charts-g2");


  lineFor(charts,"tempout", d => d.tempout);
  lineFor(g1,"t1a", d => d.t1a);
  lineFor(g1,"t1b", d => d.t1b);
  lineFor(g1,"t1c", d => d.t1c);
  lineFor(g2,"t2a", d => d.t2a);
  lineFor(g2,"t2b", d => d.t2b);
  lineFor(g2,"t2c", d => d.t2c);

  function zoomed() {
    //view.attr("transform", d3.event.transform);
    gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
    gridY.call(yAxisGrid.scale(d3.event.transform.rescaleY(yScale)));
    gridX.call(xAxisGrid.scale(d3.event.transform.rescaleX(xScale)));
    gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
    svg.selectAll(".charts")
      .attr("transform", d3.event.transform);
    d3.selectAll('.line').style("stroke-width", 2/d3.event.transform.k);
    d3.selectAll('.dot').attr("r", 5/d3.event.transform.k);
  }

  d3.select("#reset-btn")
    .on("click", resetted);

  function resetted() {
    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
  }

  d3.select("#group1-btn")
    .on("click", toggleGroup("1"));
  d3.select("#group2-btn")
    .on("click", toggleGroup("2"));
  const legende = svg.append("g")
    .attr("class","legende");
  function drawLegende(y, c, text) {
    legende.append("circle").attr("cx",10).attr("cy",y).attr("r", 4).attr("class",c);
    legende.append("text").attr("x", 20).attr("y", y).text(text).attr("alignment-baseline","middle")
  }


  legende.append("rect").attr("x",0).attr("y",0).attr("height",120).attr("width",100)
  drawLegende(10,"line-tempout", "Aussentemp" );
  drawLegende(25,"line-t1a", "t1 a" );
  drawLegende(40,"line-t1b", "t1 b" );
  drawLegende(55,"line-t1c", "t1 c" );
  drawLegende(70,"line-t2a", "t2 a" );
  drawLegende(85,"line-t2b", "t2 b" );
  drawLegende(100,"line-t2c", "t2 c" );


  function toggleGroup(g) {
    return f => {
      const groupElem = d3.select(".charts-g" + g)
      groupElem.classed("charts-hidden", !groupElem.classed("charts-hidden"));
      const btnElem = d3.select("#group"+g+"-btn")
      btnElem.classed("btn-on", !btnElem.classed("btn-on"));
    }
  }


});
