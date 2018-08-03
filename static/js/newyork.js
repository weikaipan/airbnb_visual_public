queue()
    .defer(d3.json, "/insideairbnb/listingsdropna")
    .defer(d3.json, "/insideairbnb/neighborhoodmean")
    .defer(d3.json, "static/geojson/neighbourhoods.geojson")
    .await(makeGraphs);

function makeGraphs(error, projectsJson, neighborhoodmeanJson, statesJson) {
	
	//Clean projectsJson data
	var donorschooseProjects = projectsJson;
	var neighborhoodmean = neighborhoodmeanJson
	var dateFormat = d3.time.format("%Y-%m-%d");
	donorschooseProjects.forEach(function(d) {
		d["last_scraped"] = dateFormat.parse(d["last_scraped"]);
		d["last_scraped"].setDate(1);
		d["price"] = +d["price"];
	});

	// Create Crossfilter instances
	var ndx = crossfilter(donorschooseProjects);
	var nbm = crossfilter(neighborhoodmean)

	// Define Dimensions
	// 1. Listings
	var dateDim = ndx.dimension(function(d) { return d["last_scraped"]; });
	var roomTypeDim = ndx.dimension(function(d) { return d["room_type"]; });
	var propertyTypeDim = ndx.dimension(function(d) { return d["property_type"]; });
	var neighborhoodDim = ndx.dimension(function(d) { return d["neighbourhood"]; });
	var totalPriceDim  = ndx.dimension(function(d) { return d["price"]; });

	// 2. Neighborhood Mean

	//Calculate metrics
	var numListingsByDate = dateDim.group(); 
	var numListingsByRoomType = roomTypeDim.group();
	var numListingsByPropertyType = propertyTypeDim.group();
	// var totalPriceByNeighborhood = neighborhoodDim.group().reduceSum(function(d) {
	// 	return d["price"];
	// });
	var totalPriceByNeighborhood = neighborhoodDim.group().reduce(
		function (p, v) {
			++p.count;
			p.sum += v.price;
            p.avg = p.sum / p.count;
            return p;
		},
		function (p, v) {
            --p.count;
            p.sum -= v.price;
            p.avg = p.count ? p.sum / p.count : 0;
            return p;
        },
        function () {
        	return {
        		count: 0,
        		sum: 0,
        		avg: 0
        	};
        });



	var all = ndx.groupAll();
	var totalPrice = ndx.groupAll().reduceSum(function(d) {return d["price"];});
	var max_neighborhood = totalPriceByNeighborhood.top(1)[0].value;

	//Define values (to be used in charts)
	var minDate = dateDim.bottom(1)[0]["last_scraped"];
	var maxDate = dateDim.top(1)[0]["last_scraped"];

    //Charts
	var timeChart = dc.barChart("#time-chart");
	var roomTypeChart = dc.rowChart("#room-type-row-chart");
	var propertyTypeChart = dc.pieChart("#property-type-pie-chart");
	var priceChart = dc.geoChoroplethChart("#price-chart");
	var numberListingsND = dc.numberDisplay("#number-listings-nd");
	// var totalPriceND = dc.numberDisplay("#total-donations-nd");

	numberListingsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	// totalPriceND
	// 	.formatNumber(d3.format("d"))
	// 	.valueAccessor(function(d){return d; })
	// 	.group(totalPrice)
	// 	.formatNumber(d3.format(".3s"));

	timeChart
		.width(600)
		.height(160)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(dateDim)
		.group(numListingsByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.yAxis().ticks(4);

	roomTypeChart
        .width(300)
        .height(250)
        .dimension(roomTypeDim)
        .group(numListingsByRoomType)
        .xAxis().ticks(4);

    propertyTypeChart
        .width(300)
        .height(250)
        .slicesCap(4)
        .dimension(propertyTypeDim)
        .group(numListingsByPropertyType)
        .legend(dc.legend());

	priceChart.width(1000)
		.height(500)
		.dimension(neighborhoodDim)
		.group(totalPriceByNeighborhood)
		.valueAccessor(function(kv) { return kv.value.avg; })
		.colorDomain([0, max_neighborhood])
		.overlayGeoJson(statesJson["features"], "neighborhood", function (d) {
			return d.properties.neighbourhood;
		})
		.projection(d3.geo.mercator()
  					.center([-73.80, 40.70])
  					.scale(50000)
  					.translate([(1000) / 2, (500)/2]))
		.title(function (p) {
			return "neighborhood: " + p["key"]
					+ "\n"
					+ "Average Price: " + Math.round(p["value"]) + " $";
		});
    dc.renderAll();

};