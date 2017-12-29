  // Section 1 charts
  var motChart = dc.pieChart("#mot");
  var tempConditionChart = dc.pieChart("#tempCondition");
  var transportScopeChart = dc.pieChart("#transportScope");
  var visCount = dc.dataCount(".dc-data-count");
  var visTable = dc.dataTable(".dc-data-table");
  var dayOfWeekChart = dc.rowChart('#dayOfWeekProfile');
  var quarterChart = dc.pieChart('#quarterProfile');
  var timeChart = dc.barChart("#timeChart");
  // Section 2 charts
  var boxDayChart = dc.boxPlot("#boxDayChart");
  var boxMonthChart = dc.boxPlot("#boxMonthChart")


  d3.csv("opendata.csv", function (error, data) {
    if (error) throw error;

//Data manipulation
    var dateFormat = d3.time.format('%m/%d/%Y');
    var numberFormat = d3.format('.2f');
    data.forEach(function(d) {
      d.Vol = +d.Vol;
      d["Check in Date"] = dateFormat.parse(d["Check in Date"]);
      d["Check in Date"].setFullYear(2000 + d["Check in Date"].getFullYear());
    });

//Initiate Crossfilter instance
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

//Dimensions
    var tempConditionDim = ndx.dimension(function (d) {return d["Temp. Condition"]; });
    var motDim = ndx.dimension(function (d) {return d["MoT"]; });
    var checkInDateDim = ndx.dimension(function (d) { return d["Check in Date"]; });
    var transportScopeDim = ndx.dimension(function (d) { return d.Scope;});
    var dayOfWeekDim = ndx.dimension(function (d) {
        var day = d["Check in Date"].getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return day + '.' + name[day];
    });
    var quarterDim = ndx.dimension(function (d) {
        var month = d["Check in Date"].getMonth();
        if (month <= 2) {
            return 'Q1';
        } else if (month > 2 && month <= 5) {
            return 'Q2';
        } else if (month > 5 && month <= 8) {
            return 'Q3';
        } else {
            return 'Q4';
        }
    });
    var boxDayDim = ndx.dimension(function (d) {
        var day = d["Check in Date"].getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return day + '.' + name[day];
    });
    var boxMonthDim = ndx.dimension(function (d) {
        var month = d["Check in Date"].getMonth();
        var name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return (month+1) + '.' + name[month];
    });

//Metrics
    var minDate = checkInDateDim.bottom(1)[0]["Check in Date"];
    var maxDate = checkInDateDim.top(1)[0]["Check in Date"];

    var tempConditionGroup = tempConditionDim.group();
    var motGroup = motDim.group();
    var transportScopeGroup = transportScopeDim.group();
    var dayOfWeekGroup = dayOfWeekDim.group();
    var quarterGroup = quarterDim.group();
    var checkInDateGroup = checkInDateDim.group();
    var boxDayGroup = boxDayDim.group().reduce(
      function(p,v) {
        p.push(v.Vol);
        return p;
      },
      function(p,v) {
        p.splice(p.indexOf(v.Vol), 1);
        return p;
      },
      function() {
        return [];
      }
    );
    var boxMonthGroup = boxMonthDim.group().reduce(
      function(p,v) {
        p.push(v.Vol);
        return p;
      },
      function(p,v) {
        p.splice(p.indexOf(v.Vol), 1);
        return p;
      },
      function() {
        return [];
      }
    );

//Charts
    transportScopeChart
      .width(250)
      .height(250)
      .radius(110)
      .dimension(transportScopeDim)
      .group(transportScopeGroup)
      .label(function (d) {
        if (transportScopeChart.hasFilter() && !transportScopeChart.hasFilter(d.key)) {
            return d.key + '(0%)';
        }
        var label = d.key;
        if (all.value()) {
            label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
        }
        return label;
        })
      .transitionDuration(1200)
      .renderLabel(true);

    motChart
      .width(250)
      .height(250)
      .radius(110)
      .dimension(motDim)
      .group(motGroup)
      .label(function (d) {
        if (motChart.hasFilter() && !motChart.hasFilter(d.key)) {
            return d.key + '(0%)';
        }
        var label = d.key;
        if (all.value()) {
            label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
        }
        return label;
        })
      .transitionDuration(1200)
      .renderLabel(true);

      tempConditionChart
        .width(250)
        .height(250)
        .radius(110)
        .dimension(tempConditionDim)
        .group(tempConditionGroup)
        .label(function (d) {
          if (tempConditionChart.hasFilter() && !tempConditionChart.hasFilter(d.key)) {
              return d.key + '(0%)';
          }
          var label = d.key;
          if (all.value()) {
              label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
          }
          return label;
          })
        .transitionDuration(1200)
        .renderLabel(true);

      dayOfWeekChart
        .width(280)
        .height(160)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeekDim)
        // Assign colors to each value in the x scale domain
        .ordinalColors(['#3182bd', '#3097bd', '#6baed6', '#7cbce2', '#9ecae1', '#c6dbef', '#dadaeb'])
        .label(function (d) {
            return d.key.split('.')[1];
        })
        // Title sets the row text
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(7);

      quarterChart
        .width(250)
        .height(250)
        .radius(110)
        .innerRadius(30)
        .dimension(quarterDim)
        .group(quarterGroup)
        .label(function (d) {
          if (tempConditionChart.hasFilter() && !tempConditionChart.hasFilter(d.key)) {
              return d.key + '(0%)';
          }
          var label = d.key;
          if (all.value()) {
              label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
          }
          return label;
          });

      timeChart
        .width(600)
        .height(160)
        .margins({top: 10, right: 50, bottom: 40, left: 50})
        .dimension(checkInDateDim)
        .group(checkInDateGroup)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel("Month")
        .yAxis().ticks(4);

      boxDayChart
        .width(650)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 30})
        .dimension(boxDayDim)
        .group(boxDayGroup)
        .tickFormat(d3.format(".1f"))
        .yAxisLabel("Shipment Volume (m³)")
        .elasticY(true);
        // In case that it's desirable to disable filter function.
        //filter = function() {};

        boxMonthChart
          .width(650)
          .height(300)
          .margins({top: 10, right: 50, bottom: 30, left: 30})
          .dimension(boxMonthDim)
          .group(boxMonthGroup)
          .tickFormat(d3.format(".1f"))
          .yAxisLabel("Shipment Volume (m³)")
          .elasticY(true)
          .elasticX(true);

//Table
    visCount
      .dimension(ndx)
      .group(all);

    visTable
      .dimension(checkInDateDim)
      // Data table does not use crossfilter group but rather a closure
      // as a grouping function
      .group(function (d) {
          var format = d3.format("02d");
          return d["Check in Date"].getFullYear() + "/" + format((d["Check in Date"].getMonth() + 1));
      })
      .size(10)
      .columns([
        {
          label: "Check in Date",
          format: function (d) { return dateFormat(d["Check in Date"]);}
        },
        "Shipment",
        "Plnt",
        "Temp. Condition",
        "MoT",
        {
          label: "Check in Date",
          format: function (d) { return numberFormat(d.LoadFill);}
        },
      ]);

    dc.renderAll();
  });
