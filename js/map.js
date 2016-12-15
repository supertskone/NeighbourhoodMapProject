var map;
// Create a new blank array for all the listing markers.
var markers = [];
// This global polygon variable is to ensure only ONE polygon is rendered.
var polygon = null;
// Create placemarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];
var wikiArticle;
var wikiElementsList = [];
function initMap() {
  // Create a styles array to use with the map.
  var styles = [
    {
      featureType: 'water',
      stylers: [
        { color: '#19a0d8' }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.stroke',
      stylers: [
        { color: '#ffffff' },
        { weight: 6 }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [
        { color: '#e85113' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        { color: '#efe9e4' },
        { lightness: -40 }
      ]
    },{
      featureType: 'transit.station',
      stylers: [
        { weight: 9 },
        { hue: '#e85113' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'labels.icon',
      stylers: [
        { visibility: 'off' }
      ]
    },{
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [
        { lightness: 100 }
      ]
    },{
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [
        { lightness: -100 }
      ]
    },{
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [
        { visibility: 'on' },
        { color: '#f0e4d3' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [
        { color: '#efe9e4' },
        { lightness: -25 }
      ]
    }
  ];

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 43.3157847, lng: 21.8712131},
    zoom: 11,
    styles: styles,
    mapTypeControl: false
  });

  var locations = [
    {id:0, title: 'Bulevar Nemanjica', location: {lat: 43.3150534, lng: 21.9101178}},
    {id:1, title: 'Cair Stadium', location: {lat: 43.3151933, lng: 21.9022436}},
    {id:2, title: 'Cele Kula', location: {lat: 43.3118956, lng: 21.9244491}},
    {id:3, title: 'Nis Fortress', location: {lat: 43.3237975, lng: 21.8950661}},
    {id:4, title: 'Nis', location: {lat: 43.3195493, lng: 21.8851651}},
    {id:5, title: 'University of Nis', location: {lat: 43.3212587, lng: 21.8905832}}
  ];

  //KnockoutJS part
  var viewModel = {
    theOptionId: ko.observable(1),
    query: ko.observable('')
  };
  var that = this;
  that.locationsArray = ko.observableArray([]);
  viewModel.theOptionName = ko.dependentObservable(function(){
    var result = ko.utils.arrayFirst(locations, function(option) {
          // Initially an empty array
          locationsArray.push({
            value: option.id,
            text : option.title
        });
    });
}, viewModel);

viewModel.locations = ko.dependentObservable(function() {
  var self = this;
  var search = self.query().toLowerCase();
  if (marker != undefined){
    var i = 0;
    return ko.utils.arrayFilter(locations, function(location) {
    if (location.title.toLowerCase().indexOf(search) >= 0) {
      markers[i].setMap(map);
      map.setCenter(markers[i].position);
      map.setZoom(14);
    } else {
      markers[i].setMap(null);
      }
      i++;
  });
  }
}, viewModel);
  ko.applyBindings(viewModel);

var largeInfowindow = new google.maps.InfoWindow();

  // Style for the markers
  var defaultIcon = makeMarkerIcon('0fdfff');
  var highlightedIcon = makeMarkerIcon('ff370f');

  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    var locationId = locations[i].id;

    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: locationId
    });
    loadData(marker.title, largeInfowindow);
    // Push the marker to array
    markers.push(marker);
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    marker.addListener('mouseover', function() {
      this.setAnimation(google.maps.Animation.BOUNCE);
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setAnimation(null);
      this.setIcon(defaultIcon);
    });
  }
  showListings();

  document.getElementById('show-listings').addEventListener('click', showListings);
  document.getElementById('liveExample').onchange = function (e) {
    var marker = document.getElementById('liveExample').value;
    showMarker(marker);
  }
}
// This function populates the infowindow when the marker is clicked
function populateInfoWindow(marker, infowindow) {
  // loadData(marker.title, infowindow);
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      marker.setAnimation(null);
      infowindow.marker = null;
    });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;

    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            wikiElementsList.sort();
            var wikiArticleLocation = wikiElementsList[marker.id];
            infowindow.setContent('<div>' + marker.title + '</div><br/><div id="pano"></div><hr><div>'+ "Wiki Articles:" + '<br/><br/>' + wikiArticleLocation +'</div>');
            //Display Wikipedia Links Here
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 30
              }
            };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else {
          infowindow.setContent('<div>' + marker.title + '</div>' +
            '<div>No Street View Found</div>');
        }
      }
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
  }
}

// This function will loop through the markers array and display them all.
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
};

function showMarker(marker) {
  var bounds = new google.maps.LatLngBounds();
  markers[marker].setMap(map);
  bounds.extend(markers[marker].position);
  map.fitBounds(bounds);
};

// This function will loop through the listings and hide them all.
function hideMarkers(markers) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

// This function creates markers for each place found in either places search.
function createMarkersForPlaces(places) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    var icon = {
      url: place.icon,
      size: new google.maps.Size(35, 35),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    // Create a marker for each place.
    var marker = new google.maps.Marker({
      map: map,
      icon: icon,
      title: place.name,
      position: place.geometry.location,
      id: place.place_id
    });
    // Create a single infowindow to be used with the place details information
    // so that only one is open at once.
    var placeInfoWindow = new google.maps.InfoWindow();
    // If a marker is clicked, do a place details search on it in the next function.
    marker.addListener('click', function() {
      if (placeInfoWindow.marker == this) {
        console.log("This infowindow already is on this marker!");
      } else {
        getPlacesDetails(this, placeInfoWindow);
      }
    });
    placeMarkers.push(marker);
    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  }
  map.fitBounds(bounds);
}

var $wikiElem;
function loadData(articleList, infowindow) {
  $wikiElem = "";
	var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + articleList + "&format=json&callback=wikicallback";
	 $.ajax({
		 url: wikiUrl,
		 dataType: "jsonp",
		 success: function( response ){
			 var articleList = response[1];
			 //Display just first Wiki article
				 var articleStr = articleList[0];
				 var url = 'http://en.wikipedia.org/wiki/' + articleStr;
          wikiArticle = "<li><a href='" + url + "'>" + articleStr + "</a></li>";
          wikiElementsList.push(wikiArticle);
		 },
     error: function(){
       alert("Wikipedia API throws an error!");
     }
	 });
   return wikiArticle;
};

function errorThrown() {
  alert("Google Maps failed to load, check your internet connection please!");
}
