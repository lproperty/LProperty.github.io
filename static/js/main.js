  // Section 1 charts
  var motChart = dc.pieChart("#mot");
  var tempConditionChart = dc.pieChart("#tempCondition");
  var transportScopeChart = dc.pieChart("#transportScope");
  var visCount = dc.dataCount(".dc-data-count");
  var dayOfWeekChart = dc.rowChart('#dayOfWeekProfile');
  var quarterChart = dc.pieChart('#quarterProfile');
  var timeChart = dc.barChart("#timeChart");
  var monthOfYearChart = dc.rowChart('#monthOfYearChart');

  // Section 2 charts
  var boxDayVolumeChart = dc.boxPlot("#boxDayVolumeChart");
  var boxMonthVolumeChart = dc.boxPlot("#boxMonthVolumeChart");
  var boxDayWeightChart = dc.boxPlot("#boxDayWeightChart");
  var boxMonthWeightChart = dc.boxPlot("#boxMonthWeightChart");
  var boxDayNoChart = dc.boxPlot("#boxDayNoChart");
  var boxMonthNoChart = dc.boxPlot("#boxMonthNoChart");
  var boxDayLFChart = dc.boxPlot("#boxDayLFChart");
  var boxMonthLFChart = dc.boxPlot("#boxMonthLFChart");
  var boxDayTSChart = dc.boxPlot("#boxDayTSChart");
  var boxMonthTSChart = dc.boxPlot("#boxMonthTSChart");

  //Section 3 Charts
  var costComparisonLineChart = dc.compositeChart("#costComparisonLineChart");
  var dayOfWeekTCChart = dc.compositeChart("#dayOfWeekTCChart");
  var monthOfYearTCChart = dc.compositeChart("#monthOfYearTCChart");
    //var beforeDayTSChart = dc.boxPlot("#beforeDayTSChart"); Enable for before-daily-boxplot-TS
    //var beforeMonthTSChart = dc.boxPlot("#beforeMonthTSChart"); Enable for before-monthly-boxplot-TS
    //var afterDayTSChart = dc.boxPlot("#afterDayTSChart"); Enable for after-daily-boxplot-TS
    //var afterMonthTSChart = dc.boxPlot("#afterMonthTSChart"); Enable for after-monthly-boxplot-TS
  var CSTable = dc.dataTable(".CSTable");

  //Section 4 charts
  var M2Table = dc.dataTable(".M2Table");
  var costComparisonLineChartM2 = dc.compositeChart("#costComparisonLineChartM2");

  //Section 5 charts
  var visTable = dc.dataTable(".dc-data-table");

  d3.csv("m1consolidated.csv", function (error, data){
    if (error) throw error;

    var numberFormat = d3.format('.2r');

    data.forEach(function(d) { //for each group within the 'data' array, do the following
      d.Index = +numberFormat(d.Index);
    });

    //Inititae crossfilter instance
    var matrix = crossfilter(data);

    var savingsIndex = matrix.dimension(function (d) { return d.Index;});

    CSTable
      .dimension(savingsIndex)
      .group(function (d) {return "";})
      .size(80)
      .columns([
        "Index",
        "Old Truck Type Description",
        "Old Truck Type",
        "New Truck Type Description",
        "New Truck Type",
        "Count",
        "Savings",
      ])
      .sortBy(function (d) {return d.Index;})
      .order(d3.ascending);

      dc.renderAll;
  });

  d3.csv("Cost Saving Method 2 Deep Dive.csv", function (error, data){
    if (error) throw error;

    var dateFormat = d3.time.format('%d/%m/%Y');
    var numberFormat1 = d3.format('.2f');
    var numberFormat = d3.format('.2r');

    data.forEach(function(d) { //for each group within the 'data' array, do the following
      d["Check in Date"] = dateFormat.parse(d["Check in Date"]);
      d["Check in Date"].setFullYear(2000 + d["Check in Date"].getFullYear());
      d["NewShipmentCount"] = +numberFormat(d["NewShipmentCount"]);
      d.BaseCost = +numberFormat1(d.BaseCost/1000000);
      d["Updated Base Cost"] = +numberFormat1(d["Updated Base Cost"]/1000000);
    });

    //Inititae crossfilter instance
    var matrix = crossfilter(data);

    //dimensions
    var checkInDateDim = matrix.dimension(function (d) { return d["Check in Date"]; });
    // var boxDayDim = matrix.dimension(function (d) {
    //     var day = d["Check in Date"].getDay();
    //     var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    //     return name[day];
    // });
    // var boxMonthDim = matrix.dimension(function (d) {
    //     var month = d["Check in Date"].getMonth();
    //     var name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    //     return name[month];
    // });

    //Metrics
    var minDate = checkInDateDim.bottom(1)[0]["Check in Date"];
    var maxDate = checkInDateDim.top(1)[0]["Check in Date"];
    var initialBasecostGroup = checkInDateDim.group().reduceSum(function(d){return d.BaseCost});
    var updatedBasecostGroup = checkInDateDim.group().reduceSum(function(d){return d["Updated Base Cost"]});

    costComparisonLineChartM2
      .width(800)
      .height(300)
      .margins({top: 20, right: 0, bottom: 20, left: 50})
      .dimension(checkInDateDim)
      .compose([
      dc.lineChart(costComparisonLineChartM2)
        .group(initialBasecostGroup, 'Before')
        .renderArea(true)
        .ordinalColors(['#699fce']),
      dc.lineChart(costComparisonLineChartM2)
      .group(updatedBasecostGroup, 'After')
      .renderArea(true)
      .ordinalColors(['#1e384f'])
      ])
      .transitionDuration(500)
      .x(d3.time.scale().domain([minDate, maxDate]))
      .elasticY(true)
      .yAxisLabel("Currency Cost / million")
      .brushOn(false)
      .legend(dc.legend().x(750).y(10).itemHeight(13).gap(5))
      .renderHorizontalGridLines(true)
      .renderVerticalGridLines(true);

      dc.renderAll;
  });

  d3.csv("m2consolidated.csv", function (error, data){
    if (error) throw error;

    var numberFormat = d3.format('.2r');

    data.forEach(function(d) { //for each group within the 'data' array, do the following
      d.Index = +numberFormat(d.Index);
      d["New Shipment Count"] = +numberFormat(d["New Shipment Count"]);
    });

    //Inititae crossfilter instance
    var matrix = crossfilter(data);

    var savingsIndex = matrix.dimension(function (d) { return d.Index;});

    M2Table
      .dimension(savingsIndex)
      .group(function (d) {return "";})
      .size(200)
      .columns([
        "Index",
        "Route",
        "Mode of Transport",
        "Temperature Condition",
        "Check in Date",
        "Old Shipment Count",
        "New Shipment Count",
        "Savings",
      ])
      .sortBy(function (d) {return d.Index;})
      .order(d3.ascending);

      dc.renderAll;
  });


function renderCharts(data){

    //Data manipulation: so that data is in a form that d3.js can take
    var dateFormat = d3.time.format('%d/%m/%Y');
    var numberFormat = d3.format('.2f');
    //Parsing and filtering data (CLEANING PHASE)
    data = data.filter(function(d) {
      if(d["Check in Date"] == "#N/A"
      || d["Check in Date"] == ""
      || d.Volume == ""
      || d.Gross == ""
      || d.LoadFill == ""
      || d["Std KG"] == ""
      || d["Temp. Condition"] == ""
      || d.Scope == ""
      || d.MoT == ""
      || d.BaseCost == ""
      || d["Dlv.qty"] == ""
      || d.ST == "") {
        return false;
      }
        return true;
    });
    //Mainly for data type coversion
    data.forEach(function(d) { //for each group within the 'data' array, do the following

      d.Vol = +numberFormat(d.Volume/1000000); //sets the 'Vol' values in 'data' to numeric values if it isn't already by using the '+' operator
      d.Weight = +numberFormat(d.Gross/1000); //sets the 'Weight' values in 'data' to numeric values if it isn't already by using the '+' operator
      d.LF = +numberFormat(d.LoadFill);
      d.TS = +numberFormat(d["Std KG"]/1000);
      d["Dlv.qty"] = +numberFormat(d["Dlv.qty"]);
      d["New TWeight"] = +numberFormat(d["New TWeight"]/1000);
      d["New LF"] = +numberFormat(d["New LF"]);
      d["Check in Date"] = dateFormat.parse(d["Check in Date"]);
      d["Check in Date"].setFullYear(2000 + d["Check in Date"].getFullYear());
      d.BaseCost = +numberFormat(d.BaseCost/1000000);
      d["New BC"] = +numberFormat(d["New BC"]/1000000);

    });
//Initiate Crossfilter instance
    var dat = crossfilter(data);
    var all = dat.groupAll();
    var weightSum = all.reduceSum(function(d){return d.Weight;}).value();
    var volumeSum = all.reduceSum(function(d){return d.Vol;}).value();
    var all = dat.groupAll();//Re-grouping all data

//Dimensions
    var tempConditionDim = dat.dimension(function (d) {return d["Temp. Condition"]; });
    var motDim = dat.dimension(function (d) {return d["MoT"]; });
    var checkInDateDim = dat.dimension(function (d) { return d["Check in Date"]; });
    var transportScopeDim = dat.dimension(function (d) { return d.Scope;});
    var dayOfWeekDim = dat.dimension(function (d) {
        var day = d["Check in Date"].getDay();
        var name = ['7.Sun', '1.Mon', '2.Tue', '3.Wed', '4.Thu', '5.Fri', '6.Sat'];
        return name[day];
    });
    var monthOfYearDim = dat.dimension(function (d) {
        var month = d["Check in Date"].getMonth();
        var name = ['1.Jan', '2.Feb', '3.Mar', '4.Apr', '5.May', '6.Jun', '7.Jul', '8.Aug', '9.Sep', '10.Oct', '11.Nov', '12.Dec'];
        return name[month];
    });
    var quarterDim = dat.dimension(function (d) {
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

    var boxDayDim = dat.dimension(function (d) {
        var day = d["Check in Date"].getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return name[day];
    });
    var boxMonthDim = dat.dimension(function (d) {
        var month = d["Check in Date"].getMonth();
        var name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return name[month];
    });

//Metrics
    var minDate = checkInDateDim.bottom(1)[0]["Check in Date"];
    var maxDate = checkInDateDim.top(1)[0]["Check in Date"];

    var tempConditionGroup = tempConditionDim.group().reduceSum(function(d){return d.Weight});
    var motGroup = motDim.group().reduceSum(function(d){return d.Weight});
    var transportScopeGroup = transportScopeDim.group().reduceSum(function(d){return d.Weight});
    var dayOfWeekGroup = dayOfWeekDim.group();
    var monthOfYearGroup = monthOfYearDim.group();
    var quarterGroup = quarterDim.group().reduceSum(function(d){return d.Weight});
    var checkInDateGroup = checkInDateDim.group();
    var initialBasecostGroup = checkInDateDim.group().reduceSum(function(d){return d.BaseCost});
    var newTruckCostGroup = checkInDateDim.group().reduceSum(function(d){return d["New BC"]});

    var lineDayTSGroup = boxDayDim.group().reduce(
      function(p, v){
        ++p.days;
        p.total += v.TS;
        p.avg = Math.round(p.total/p.days);
        return p;
      },
      function(p, v){
        --p.days;
        p.total -= v.TS;
        p.avg = p.days ? Math.round(p.total/p.days) : 0;
        return p;
      },
      function() {
        return {days: 0, total: 0, avg: 0};
      }
    );

    var lineDayTWGroup = boxDayDim.group().reduce(
      function(p, v){
        ++p.days;
        p.total += v["New TWeight"];
        p.avg = Math.round(p.total/p.days);
        return p;
      },
      function(p, v){
        --p.days;
        p.total -= v["New TWeight"];
        p.avg = p.days ? Math.round(p.total/p.days) : 0;
        return p;
      },
      function() {
        return {days: 0, total: 0, avg: 0};
      }
    );

    var lineMonthTSGroup = boxMonthDim.group().reduce(
      function(p, v){
        ++p.days;
        p.total += v.TS;
        p.avg = Math.round(p.total/p.days);
        return p;
      },
      function(p, v){
        --p.days;
        p.total -= v.TS;
        p.avg = p.days ? Math.round(p.total/p.days) : 0;
        return p;
      },
      function() {
        return {days: 0, total: 0, avg: 0};
      }
    );

    var lineMonthTWGroup = boxMonthDim.group().reduce(
      function(p, v){
        ++p.days;
        p.total += v["New TWeight"];
        p.avg = Math.round(p.total/p.days);
        return p;
      },
      function(p, v){
        --p.days;
        p.total -= v["New TWeight"];
        p.avg = p.days ? Math.round(p.total/p.days) : 0;
        return p;
      },
      function() {
        return {days: 0, total: 0, avg: 0};
      }
    );

    var boxDayTSGroup = boxDayDim.group().reduce(
      function(p,v) {
        p.push(v.TS);
        return p;
      },
      function(p,v) {
        p.splice(p.indexOf(v.TS), 1);
        return p;
      },
      function() {
        return [];
      }
    );
    var boxMonthTSGroup = boxMonthDim.group().reduce(
      function(p,v) {
        p.push(v.TS);
        return p;
      },
      function(p,v) {
        p.splice(p.indexOf(v.TS), 1);
        return p;
      },
      function() {
        return [];
      }
    );
    // var boxDayNTSGroup = boxDayDim.group().reduce(  //for new truck size in tonage
    //   function(p,v) {
    //     p.push(v["New TWeight"]);
    //     return p;
    //   },
    //   function(p,v) {
    //     p.splice(p.indexOf(v["New TWeight"]), 1);
    //     return p;
    //   },
    //   function() {
    //     return [];
    //   }
    // );
    // var boxMonthNTSGroup = boxMonthDim.group().reduce(  //for new truck size in tonnage
    //   function(p,v) {
    //     p.push(v["New TWeight"]);
    //     return p;
    //   },
    //   function(p,v) {
    //     p.splice(p.indexOf(v["New TWeight"]), 1);
    //     return p;
    //   },
    //   function() {
    //     return [];
    //   }
    // );
    var boxDayLFGroup = boxDayDim.group().reduce(
      function(p,v) {
        p.push(v.LF);
        return p;
      },
      function(p,v) {
        p.splice(p.indexOf(v.LF), 1);
        return p;
      },
      function() {
        return [];
      }
    );

    var boxMonthLFGroup = boxMonthDim.group().reduce(
      function(p,v) {
        p.push(v.LF);
        return p;
      },
      function(p,v) {
        p.splice(p.indexOf(v.LF), 1);
        return p;
      },
      function() {
        return [];
      }
    );

    var boxDayVolumeGroup = boxDayDim.group().reduce(
      function(p,v) {
        var index = p.map(function(d) { return d.date.getTime();}).indexOf(v["Check in Date"].getTime());
        if(index == -1) {
          p.push({date:v["Check in Date"], volume:v.Vol});
        }
        else {
          p[index]["volume"] = Math.round((p[index]["volume"]+v.Vol) * 10) / 10;
        }
        return p;
      },
      function(p,v) {
        var index = p.map(function(d) { return d.date.getTime();}).indexOf(v["Check in Date"].getTime());
        if( (p[index]["volume"] - v.Vol) < -0.001) { //0.001 is to avoid rounding-off error
          throw error;
        }
        if(p[index]["volume"] == v.Vol) {
          p.splice(index,1);
        }
        else {
          p[index]["volume"] = Math.round((p[index]["volume"]-v.Vol) * 10) / 10;
        }
        return p;
      },
      function() {
        return [];
      }
    );
    var boxMonthVolumeGroup = boxMonthDim.group().reduce(
      function(p,v) {
        var index = p.map(function(d) { return d.date.getTime();}).indexOf(v["Check in Date"].getTime());
        if(index == -1) {
          p.push({date:v["Check in Date"], volume:v.Vol});
        }
        else {
          p[index]["volume"] = Math.round((p[index]["volume"]+v.Vol) * 10) / 10;
        }
        return p;
      },
      function(p,v) {
        var index = p.map(function(d) { return d.date.getTime();}).indexOf(v["Check in Date"].getTime());
        if( (p[index]["volume"] - v.Vol) < -0.001) { //0.001 is to avoid rounding-off error
          throw error;
        }
        if(p[index]["volume"] == v.Vol) {
          p.splice(index,1);
        }
        else {
          p[index]["volume"] = Math.round((p[index]["volume"]-v.Vol) * 10) / 10;
        }
        return p;
      },
      function() {
        return [];
      }
    );

    var boxDayWeightGroup = boxDayDim.group().reduce(
      function(p,v) {
        var index = p.map(function(d) { return d.date.getTime();}).indexOf(v["Check in Date"].getTime());
        if(index == -1) {
          p.push({date:v["Check in Date"], weight:v.Weight});
        }
        else {
          p[index]["weight"] = Math.round((p[index]["weight"]+v.Weight) * 10) / 10;
        }
        return p;
      },
      function(p,v) {
        var index = p.map(function(d) { return d.date.getTime();}).indexOf(v["Check in Date"].getTime());
        if( (p[index]["weight"] - v.Weight) < -0.001) { //0.001 is to avoid rounding-off error
          throw error;
        }
        if(p[index]["weight"] == v.Weight) {
          p.splice(index,1);
        }
        else {
          p[index]["weight"] = Math.round((p[index]["weight"]-v.Weight) * 10) / 10;
        }
        return p;
      },
      function() {
        return [];
      }
    );
    var boxMonthWeightGroup = boxMonthDim.group().reduce(
      function(p,v) {
        var index = p.map(function(d) { return d.date.getTime();}).indexOf(v["Check in Date"].getTime());
        if(index == -1) {
          p.push({date:v["Check in Date"], weight:v.Weight});
        }
        else {
          p[index]["weight"] = Math.round((p[index]["weight"]+v.Weight) * 10) / 10;
        }
        return p;
      },
      function(p,v) {
        var index = p.map(function(d) { return d.date.getTime();}).indexOf(v["Check in Date"].getTime());
        if( (p[index]["weight"] - v.Weight) < -0.001) { //0.001 is to avoid rounding-off error
          throw error;
        }
        if(p[index]["weight"] == v.Weight) {
          p.splice(index,1);
        }
        else {
          p[index]["weight"] = Math.round((p[index]["weight"]-v.Weight) * 10) / 10;
        }
        return p;
      },
      function() {
        return [];
      }
    );

    var boxDayNoGroup = boxDayDim.group().reduce(
      function(p,v) {
        var index = p.map(function(d) { return d.date.getTime();}).indexOf(v["Check in Date"].getTime());
        if(index == -1) {
          p.push({date:v["Check in Date"], number:1});
        }
        else {
          p[index]["number"]++;
        }
        return p;
      },
      function(p,v) {
        var index = p.map(function(d) { return d.date.getTime();}).indexOf(v["Check in Date"].getTime());
        if( (p[index]["number"]) <= 0) {
          throw error;
        }
        p[index]["number"]--;
        //splice the "0"s off
        if(p[index]["number"] == 0) {
          p.splice(index,1);
        }
        return p;
      },
      function() {
        return [];
      }
    );

    var boxMonthNoGroup = boxMonthDim.group().reduce(
      function(p,v) {
        var index = p.map(function(d) { return d.date.getTime();}).indexOf(v["Check in Date"].getTime());
        if(index == -1) {
          p.push({date:v["Check in Date"], number:1});
        }
        else {
          p[index]["number"]++;
        }
        return p;
      },
      function(p,v) {
        var index = p.map(function(d) { return d.date.getTime();}).indexOf(v["Check in Date"].getTime());
        if( p[index]["number"] <= 0) {
          throw error;
        }
        p[index]["number"]--;
        //splice the "0"s off
        if(p[index]["number"] == 0) {
          p.splice(index,1);
        }
        return p;
      },
      function() {
        return [];
      }
    );
//Helper funtions
function checkTimeEqual(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr].getTime() == value.getTime()) {
            return i;
        }
    }
    return -1;
}

//Miscellaneous
document.getElementById("dateRange").innerHTML = 'Date Range: ' + dateFormat(minDate) + ' to ' + dateFormat(maxDate);
$( "dateSelect" ).data( dateFormat(maxDate) + dateFormat(minDate) );

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
            label += '(' + Math.floor(d.value / weightSum * 100) + '%)';
        }
        return label;
        })
      .minAngleForLabel(0.1)
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
            label += '(' + Math.floor(d.value / weightSum * 100) + '%)';
        }
        return label;
        })
      .transitionDuration(1200)
      .minAngleForLabel(0.1)
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
              label += '(' + Math.floor(d.value / weightSum * 100) + '%)';
          }
          return label;
          })
        .minAngleForLabel(0.1)
        .transitionDuration(1200)
        .renderLabel(true);

      dayOfWeekChart
        .width(280)
        .height(200)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeekDim)
        // Assign colors to each value in the x scale domain
        .ordinalColors(['#3182bd', '#3097bd', '#6baed6', '#7cbce2', '#9ecae1', '#c6dbef', '#dadaeb'])
        .ordering(function(){return;})
        .label(function (d) {
            return d.key.split('.')[1];
        })
        // Title sets the row text
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(7);

      monthOfYearChart
        .width(280)
        .height(200)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(monthOfYearGroup)
        .dimension(monthOfYearDim)
        // Assign colors to each value in the x scale domain
        // .ordinalColors(['#3182bd', '#3097bd', '#6baed6', '#7cbce2', '#9ecae1', '#c6dbef', '#dadaeb'])
        .ordering(function(){return;})
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
        .minAngleForLabel(0.1)
        .label(function (d) {
          if (tempConditionChart.hasFilter() && !tempConditionChart.hasFilter(d.key)) {
              return d.key + '(0%)';
          }
          var label = d.key;
          if (all.value()) {
              label += '(' + Math.floor(d.value / weightSum * 100) + '%)';
          }
          return label;
          });

      timeChart
        .width(650)
        .height(200)
        .margins({top: 10, right: 50, bottom: 20, left: 50})
        .dimension(checkInDateDim)
        .group(checkInDateGroup)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .yAxis().ticks(4);

      boxDayVolumeChart
        .width(450)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 30})
        .dimension(boxDayDim)
        .group(boxDayVolumeGroup)
        .valueAccessor(function(p) {
          var array = [];
          for(var i = 0; i < p.value.length; i += 1) {
            array.push(p.value[i].volume);
          }
          return array;
        })
        .ordinalColors(['#9ecae1'])
        .x(d3.scale.ordinal().domain(["Mon", "Tue", "Wed", "Thu","Fri","Sat","Sun"]))
        .tickFormat(d3.format(".2s"))
        .yAxisLabel("Shipment Volume (m³)")
        .elasticY(true)
        .yAxisPadding("5%")
        .filter = function() {};
      boxDayVolumeChart.yAxis().tickFormat(d3.format(".1s"));

      boxMonthVolumeChart
        .width(850)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 30})
        .dimension(boxMonthDim)
        .group(boxMonthVolumeGroup)
        .valueAccessor(function(p) {
          var array = [];
          for(var i = 0; i < p.value.length; i += 1) {
            array.push(p.value[i].volume);
          }
          return array;
        })
        .ordinalColors(['#9ecae1'])
        .x(d3.scale.ordinal().domain(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']))
        .tickFormat(d3.format(".2s"))
        .yAxisLabel("Shipment Volume (m³)")
        .elasticY(true)
        // .elasticX(true)
        .yAxisPadding("5%")
        .filter = function() {};
      boxMonthVolumeChart.yAxis().tickFormat(d3.format(".1s"));

      boxDayWeightChart
        .width(450)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 30})
        .dimension(boxDayDim)
        .group(boxDayWeightGroup)
        .valueAccessor(function(p) {
          var array = [];
          for(var i = 0; i < p.value.length; i += 1) {
            array.push(p.value[i].weight);
          }
          return array;
        })
        .ordinalColors(['#9ecae1'])
        .x(d3.scale.ordinal().domain(["Mon", "Tue", "Wed", "Thu","Fri","Sat","Sun"]))
        .tickFormat(d3.format(".2s"))
        .yAxisLabel("Shipment Weight (t)")
        .elasticY(true)
        .yAxisPadding("5%")
        .filter = function() {};
      boxDayWeightChart.yAxis().tickFormat(d3.format(".1s"));

      boxMonthWeightChart
        .width(850)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 30})
        .dimension(boxMonthDim)
        .group(boxMonthWeightGroup)
        .valueAccessor(function(p) {
          var array = [];
          for(var i = 0; i < p.value.length; i += 1) {
            array.push(p.value[i].weight);
          }
          return array;
        })
        .ordinalColors(['#9ecae1'])
        .x(d3.scale.ordinal().domain(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']))
        .tickFormat(d3.format(".2s"))
        .yAxisLabel("Shipment Weight (t)")
        .elasticY(true)
        .yAxisPadding("5%")
        .filter = function() {};
      //(the lib seems to not allow yAxis function in the main chart block)
      boxMonthWeightChart.yAxis().tickFormat(d3.format(".1s"));

      boxDayNoChart
        .width(450)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 30})
        .dimension(boxDayDim)
        .group(boxDayNoGroup)
        .valueAccessor(function(p) {
          var array = [];
          for(var i = 0; i < p.value.length; i += 1) {
            array.push(p.value[i].number);
          }
          return array;
        })
        .ordinalColors(['#9ecae1'])
        .x(d3.scale.ordinal().domain(["Mon", "Tue", "Wed", "Thu","Fri","Sat","Sun"]))
        .yAxisLabel("Number of Shipments")
        .elasticY(true)
        .yAxisPadding("5%")
        .filter = function() {};

      boxMonthNoChart
        .width(850)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 30})
        .dimension(boxMonthDim)
        .group(boxMonthNoGroup)
        .valueAccessor(function(p) {
          var array = [];
          for(var i = 0; i < p.value.length; i += 1) {
            array.push(p.value[i].number);
          }
          return array;
        })
        .ordinalColors(['#9ecae1'])
        .x(d3.scale.ordinal().domain(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']))
        .yAxisLabel("Number of Shipments")
        .elasticY(true)
        .yAxisPadding("5%")
        .filter = function() {};

      boxDayLFChart
        .width(450)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 30})
        .dimension(boxDayDim)
        .group(boxDayLFGroup)
        .ordinalColors(['#9ecae1'])
        .x(d3.scale.ordinal().domain(["Mon", "Tue", "Wed", "Thu","Fri","Sat","Sun"]))
        .yAxisLabel("Load Fill Percentage")
        .elasticY(true)
        .yAxisPadding("5%")
        .filter = function() {};

      boxMonthLFChart
        .width(850)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 30})
        .dimension(boxMonthDim)
        .group(boxMonthLFGroup)
        .ordinalColors(['#9ecae1'])
        .x(d3.scale.ordinal().domain(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']))
        .yAxisLabel("Load Fill Percentage")
        .elasticY(true)
        .yAxisPadding("5%")
        .filter = function() {};

      boxDayTSChart
        .width(450)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 30})
        .dimension(boxDayDim)
        .group(boxDayTSGroup)
        .ordinalColors(['#9ecae1'])
        .x(d3.scale.ordinal().domain(["Mon", "Tue", "Wed", "Thu","Fri","Sat","Sun"]))
        .yAxisLabel("Truck Size (t)")
        .elasticY(true)
        .yAxisPadding("5%")
        .filter = function() {};

      boxMonthTSChart
        .width(850)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 30})
        .dimension(boxMonthDim)
        .group(boxMonthTSGroup)
        .ordinalColors(['#9ecae1'])
        .x(d3.scale.ordinal().domain(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']))
        .yAxisLabel("Truck Size (t)")
        .elasticY(true)
        .yAxisPadding("5%")
        .filter = function() {};


      costComparisonLineChart
        .width(800)
        .height(300)
        .margins({top: 20, right: 0, bottom: 20, left: 50})
        .dimension(checkInDateDim)
        .compose([
        dc.lineChart(costComparisonLineChart)
          .group(initialBasecostGroup, 'Before')
          .renderArea(true)
          .ordinalColors(['#699fce']),
        dc.lineChart(costComparisonLineChart)
        .group(newTruckCostGroup, 'After')
        .renderArea(true)
        .ordinalColors(['#1e384f'])
        ])
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .yAxisLabel("Currency Cost / million")
        .brushOn(false)
        .legend(dc.legend().x(750).y(10).itemHeight(13).gap(5))
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true);

      dayOfWeekTCChart
        .width(550)
        .height(300)
        .margins({top: 40, right: 40, bottom: 20, left: 30})
        .dimension(boxDayDim)
        .x(d3.scale.ordinal().domain(boxDayDim.top(Infinity).map(function (d) {
            var day = d["Check in Date"].getDay();
            var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return name[day];
        })))
        .xUnits(dc.units.ordinal)
        ._rangeBandPadding(1) //Super important!!!
        .compose([
          dc.lineChart(dayOfWeekTCChart)
            .group(lineDayTSGroup, 'Before')
            .valueAccessor(function(d) {
        			return d.value.avg;
        			})
            .renderArea(true)
            .ordinalColors(['#699fce']),
          dc.lineChart(dayOfWeekTCChart)
            .group(lineDayTWGroup, 'After')
            .valueAccessor(function(d) {
              return d.value.avg;
              })
            .renderArea(true)
            .ordinalColors(['#1e384f'])
         ])
        .transitionDuration(500)
        .elasticY(true)
        .yAxisLabel("Truck Size (t)")
        .brushOn(false)
        .legend(dc.legend().x(500).y(10).itemHeight(13).gap(5))
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true);

        monthOfYearTCChart
          .width(800)
          .height(300)
          .margins({top: 20, right: 0, bottom: 20, left: 50})
          .dimension(boxMonthDim)
          .x(d3.scale.ordinal().domain(boxMonthDim.top(Infinity).map(function (d) {
              var month = d["Check in Date"].getMonth();
              var name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return name[month];
          })))
          .xUnits(dc.units.ordinal)
          ._rangeBandPadding(1) //Super important!!!
          .compose([
            dc.lineChart(monthOfYearTCChart)
              .group(lineMonthTSGroup, 'Before')
              .valueAccessor(function(d) {
                return d.value.avg;
                })
              .renderArea(true)
              .ordinalColors(['#699fce']),
            dc.lineChart(monthOfYearTCChart)
              .group(lineMonthTWGroup, 'After')
              .valueAccessor(function(d) {
                return d.value.avg;
                })
              .renderArea(true)
              .ordinalColors(['#1e384f'])
           ])
          .transitionDuration(500)
          .elasticY(true)
          .yAxisLabel("Truck Size (t)")
          .brushOn(false)
          .legend(dc.legend().x(750).y(10).itemHeight(13).gap(5))
          .renderHorizontalGridLines(true)
          .renderVerticalGridLines(true);

      //COST1 BEFORE-DAY-BOXPLOT-TS
      // beforeDayTSChart
      //   .width(450)
      //   .height(300)
      //   .margins({top: 10, right: 50, bottom: 30, left: 30})
      //   .dimension(boxDayDim)
      //   .group(boxDayTSGroup)
      //   .ordinalColors(['#9ecae1'])
      //   .x(d3.scale.ordinal().domain(["Mon", "Tue", "Wed", "Thu","Fri","Sat","Sun"]))
      //   .yAxisLabel("Truck Size (t)")
      //   .elasticY(true)
      //   .yAxisPadding("5%")
      //   .filter = function() {};

      // beforeMonthTSChart
      //   .width(850)
      //   .height(300)
      //   .margins({top: 10, right: 50, bottom: 30, left: 30})
      //   .dimension(boxMonthDim)
      //   .group(boxMonthTSGroup)
      //   .ordinalColors(['#9ecae1'])
      //   .x(d3.scale.ordinal().domain(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']))
      //   .yAxisLabel("Truck Size (t)")
      //   .elasticY(true)
      //   .yAxisPadding("5%")
      //   .filter = function() {};

      //COST1 BEFORE-DAY-BOXPLOT-TS
      // afterDayTSChart
      //   .width(450)
      //   .height(300)
      //   .margins({top: 10, right: 50, bottom: 30, left: 30})
      //   .dimension(boxDayDim)
      //   .group(boxDayNTSGroup)
      //   .ordinalColors(['#00cc00'])
      //   .x(d3.scale.ordinal().domain(["Mon", "Tue", "Wed", "Thu","Fri","Sat","Sun"]))
      //   .yAxisLabel("Truck Size (t)")
      //   .elasticY(true)
      //   .yAxisPadding("5%")
      //   .filter = function() {};

      // afterMonthTSChart
      //   .width(850)
      //   .height(300)
      //   .margins({top: 10, right: 50, bottom: 30, left: 30})
      //   .dimension(boxMonthDim)
      //   .group(boxMonthNTSGroup)
      //   .ordinalColors(['#00cc00'])
      //   .x(d3.scale.ordinal().domain(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']))
      //   .yAxisLabel("Truck Size (t)")
      //   .elasticY(true)
      //   .yAxisPadding("5%")
      //   .filter = function() {};

//Table
    visCount
      .dimension(dat)
      .group(all);


    var casesGroup = checkInDateDim.group().reduceSum(function(d){return d["Dlv.qty"]});
    var costsGroup = checkInDateDim.group().reduceSum(function(d){return d.BaseCost});
    var tonsGroup = checkInDateDim.group().reduceSum(function(d){return d.Weight});
    var meter3Group = checkInDateDim.group().reduceSum(function(d){return d.Vol});
    var totalBCGroup = checkInDateDim.group().reduceSum(function(d){return d.BaseCost});
    var totalNBCGroup = checkInDateDim.group().reduceSum(function(d){return d["New BC"]});

    // var totalBCGroup = checkInDateDim.group().reduceSum(function(d){return d.BaseCost});



    visTable
      .dimension(checkInDateDim)
      // Data table does not use crossfilter group but rather a closure
      // as a grouping function
      .group(function (d) {
          var format = d3.format("02d");
          return d["Check in Date"].getFullYear() + "/" + format((d["Check in Date"].getMonth() + 1));
      })
      .size(200)
      .on('renderlet',function (d) {
        var format = d3.format(",.4f");
        var formatInteger = d3.format(",.0f");
        var formatSF = d3.format(".4s");


        var totalCases = formatInteger(sumValue(casesGroup.all()));
        var averageCostPerCase = format(sumValue(costsGroup.all()) / sumValue(casesGroup.all()) );
        var totalTons = formatInteger(sumValue(tonsGroup.all()));
        var avergeCostPerTon = format(sumValue(costsGroup.all()) / sumValue(tonsGroup.all()) );
        var totalMeter3 = formatInteger(sumValue(meter3Group.all()));
        var totalBC = formatInteger(sumValue(totalBCGroup.all()));
        var totalNBC = formatInteger(sumValue(totalNBCGroup.all()));
        var averageCostPerCaseAfter = format(sumValue(totalNBCGroup.all()) / sumValue(casesGroup.all()) );
        var avergeCostPerTonAfter = format(sumValue(totalNBCGroup.all()) / sumValue(tonsGroup.all()) );


        d3.select("#TotalCases").text(totalCases);
        d3.select("#AvergeCostPerCase").text(averageCostPerCase);
        d3.select("#TotalTons").text(totalTons);
        d3.select("#AvergeCostPerTon").text(avergeCostPerTon);
        d3.select("#TotalMeter3").text(totalMeter3);
        d3.select("#totalBC").text(totalBC);
        d3.select("#totalNBC").text(totalNBC);
        d3.select("#AvergeCostPerCaseBefore").text(averageCostPerCase);
        d3.select("#AverageCostPerCaseAfter").text(averageCostPerCaseAfter);
        d3.select("#AvergeCostPerTonBefore").text(avergeCostPerTon);
        d3.select("#AvergeCostPerTonAfter").text(avergeCostPerTonAfter);



        return;
      })
      .columns([
        {
          label: "Check in Date",
          format: function (d) { return dateFormat(d["Check in Date"]);}
        },
        "Shipment",
        "Plnt",
        "Dlv.qty",
        "Temp. Condition",
        "MoT",
        {
          label: "Load Fill",
          format: function (d) { return numberFormat(d.LoadFill);}
        },
      ]);

    dc.renderAll();
};

//--------------------------------------------------------------------
function sumValue(d) {
  var value = 0;
  d.forEach(function(p) {
    value +=p.value;
  });
  return value;
};
//local csv and renders all charts
function load_dataset(csv) {
  var data = d3.csv.parse(csv);
  renderCharts(data);
}
// handle upload button
function upload_button(el, callback) {
  var uploader = document.getElementById(el);
  var reader = new FileReader();

  reader.onload = function(e) {
    var contents = e.target.result;
    callback(contents);
  };

  uploader.addEventListener("change", handleFiles, false);

  function handleFiles() {
    var file = this.files[0];
    reader.readAsText(file);
  };
};
