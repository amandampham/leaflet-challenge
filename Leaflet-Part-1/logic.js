
let earthquakeMarkers = [];

// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

 // Function to Determine Style of Marker Based on the Magnitude of the Earthquake
 function styleInfo(feature) {
  return {
    opacity: 1,
    fillOpacity: 1,
    fillColor: getColorByDepth(feature.geometry.coordinates[2]),
    radius: markerSize(feature.properties.mag),
    stroke: true,
    weight: 0.5
  };
}

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p><b>Magnitude</b>: ${feature.properties.mag}</p><p><b>Depth:</b> ${feature.geometry.coordinates[2]}</p><p><b>Time & Date:</b>${new Date(feature.properties.time)}</p>`);
    

  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    style: styleInfo,
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
  }
  });


  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes,
  };

  // Create our map, giving it the topo and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      0, 0
    ],
    zoom: 1.5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

   // Set Up Legend
   var legend = L.control({ position: "bottomright" });
   legend.onAdd = function() {
       var div = L.DomUtil.create("div", "info legend")

       // Make sample depths
       sampleDepths = [0, 25, 110, 200];
       div.innerHTML += "<h3>Depth</h3>"

       for (var i = 0; i < sampleDepths.length; i++) {
           div.innerHTML +=
               '<i style="background: ' + getColorByDepth(sampleDepths[i]) + '"></i> ' +
               sampleDepths[i] + (sampleDepths[i + 1] ? '&ndash;' + sampleDepths[i + 1] + '<br>' : '+');
       }
       return div;
   };
   // Add Legend to the Map
   legend.addTo(myMap);

}

function getColorByDepth(depth) {
  // Define your color ranges based on the depth values
  // For example:
  if (depth < 25) {
    return "#14FF23"; // Green
  } else if (depth < 110) {
    return "#FFF200"; // Yellow
  } else if (depth < 177) {
    return "#FFA210"; // Orange
  } else if (depth < 227) {
    return "#ED1C24"; // Red
  }
}


  // A function to determine the marker size based on the population
function markerSize(magnitude) {
  if (magnitude === 0) {
    return 1;
  }
  return magnitude * 1.5;
}