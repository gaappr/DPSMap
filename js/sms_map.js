var SMSMap = {
    backgroundColor: "rgba(0,0,0,0.75)",
    textColor: "white",
    effectColor: "#777777",

    //Change the following two objects when a new image is added
    mapIcon: {
        'url': './images/dot.png',
        'size': new google.maps.Size(30, 30),
        'origin': new google.maps.Point(0, 0),
        'anchor': new google.maps.Point(15, 15)
    },
    mapShape: {
        'coords': [19, 5, 19, 29, 11, 19, 4, 25, 25, 47, 45, 25, 39, 19, 29, 28, 30, 4, 19, 4],
        'type': 'poly'
    },

    map:{},

    //This is an array that will be used to keep track of the points in the map
    mapPoints:[],

    /**
     *   initiateMap
     *   Called initially to setup the map - there will be no points on the map initially
     **/
    initiateMap: function () {
        SMSMap.filteredArray = SMSMap.coopData;
        SMSMap.drawControls();
        var mapOptions = {
            'zoom': 3,
            'center': new google.maps.LatLng(38.611563, -98.545487),
            'mapTypeControl': false,
            'navigationControl': false,
            'streetViewControl': false,
            'styles': SMSMap.mapStyle
        };
        SMSMap.map = new google.maps.Map(document.getElementById('smsMap'),
      mapOptions);
    },

    /**
     *   drawMap
     *   parses through the coopData array and adds points to the map with the help of the drawPoint function.
     **/
    drawMap: function () {
        for (var i = 0; i < SMSMap.filteredArray.length; i++) {
            //Retrieve marker info due to the deferred callback below
            SMSMap.createPoint(SMSMap.filteredArray[i].lat, SMSMap.filteredArray[i].long, i, false);
        }
        SMSMap.drawPoints();
    },

    /**
     *   createPoint
     *   This will actually draw a point on the map and add information about that point to the
     *   map. Also sets up an onclick listener to enable the viewing of the information in the map
     *
     *   @param lat - the latitude of the point you would like to draw
     *   @param long - the longitude of the point you would like to draw
     *   @param arrayLocation - the location in the coopArray you are pulling this point from
     *   @param bounds - boolean indicating whether the points should be bounded into the map display or not.
     **/
    createPoint: function (lat, long, arrayLocation, bounds) {
        var point = {
            'position': new google.maps.LatLng(lat,long),
            'bounds': bounds,
            'animation': google.maps.Animation.DROP,
            'icon': SMSMap.mapIcon,
        };
        var googlePoint = new google.maps.Marker( point );

        google.maps.event.addListener(googlePoint,'click',function(){
            SMSMap.drawInfoDiv(arrayLocation);
        });

        SMSMap.mapPoints.push( googlePoint );
    },

    drawPoints: function(){
        for( var i=0; i<SMSMap.filteredArray.length; i++ ){
            SMSMap.mapPoints[i].setMap(SMSMap.map);
        }
    },

    /**
     *   setWrapperSize
     *   A utility function to set the size of the map relative to the size of the screen it is being displayed on.
     **/
    setWrapperSize: function () {
        var wrapperDiv = document.getElementById("wrapper");
        wrapper.style.width = window.innerWidth + "px";
        wrapper.style.height = window.innerHeight + "px";
    },

    /**
     *   drawInfoDiv
     *   Actually draws the information regarding each city. This function specifically handles the creation of
     *   the box and the associated styling
     *
     *   @param arrayLoc - The array location within coopData array that we are going to display on the screen
     **/
    drawInfoDiv: function (arrayLoc) {
        var infoDiv = document.createElement("div");
        infoDiv.id = "infoDiv";

        //All of the styling is done here
        infoDiv.style.width = window.innerWidth + "px";
        infoDiv.style.height = window.innerHeight + "px";
        infoDiv.style.position = "absolute";
        infoDiv.style.left = "0px";
        infoDiv.style.top = "0px";
        infoDiv.style.zIndex = 100;
        infoDiv.style.overflow = "scroll";
        infoDiv.style.backgroundColor = SMSMap.backgroundColor;
        infoDiv.style.color = SMSMap.textColor;

        //All of the content added to the div below
        infoDiv.appendChild(SMSMap.createInfoClose());
        infoDiv.appendChild(SMSMap.createCityName(arrayLoc));

        if (SMSMap.filteredArray[arrayLoc].companies.length > 0) {
            for (var i = 0; i < SMSMap.filteredArray[arrayLoc].companies.length; i++) {
                var companyLink = document.createElement("a");
                companyLink.href = SMSMap.filteredArray[arrayLoc].companies[i].website;
                companyLink.style.textDecoration = "none";
                companyLink.style.color = SMSMap.textColor;
                companyLink.style.fontSize = "30px";
                companyLink.style.textAlign = "center";
                companyLink.appendChild(document.createTextNode(SMSMap.filteredArray[arrayLoc].companies[i].name));
                companyLink.style.display = "block";
                SMSMap.addTextTouchEffect(companyLink);
                infoDiv.appendChild(companyLink);
            }
        } else {
            var defaultPara = document.createElement("p");
            defaultPara.style.textAlign = "center";
            defaultPara.appendChild(document.createTextNode(
                "We're sorry, we can't find the company names, but someone did go on co-op in this city!"));
            infoDiv.appendChild(defaultPara);
        }

        document.getElementById("wrapper").appendChild(infoDiv);
    },

    /**
     *   createCityName
     *   Extracts the city and state information from the coopData array and creates an element suitable for placement within
     *   the info div
     *
     *   @param arrayLoc - The array location within the coopData array that we are going to get the city information from
     **/
    createCityName: function (arrayLoc) {
        var cityName = document.createElement("h1");
        var city = SMSMap.filteredArray[arrayLoc].city;
        var state = SMSMap.filteredArray[arrayLoc].state;
        var country = SMSMap.filteredArray[arrayLoc].country;
        var cityString = city;
        if (state) {
            cityString += ", " + state;
        } else if (country) {
            cityString += ", " + country;
        }
        cityName.appendChild(document.createTextNode(cityString));
        cityName.style.fontSize = "45px";
        cityName.style.textAlign = "center";
        return cityName;
    },

    /**
     *   createInfoClose
     *   Creates that button the will remove the infoDiv. This funcation also assigns and handles the necessary events
     *   associated with the close button.
     **/
    createInfoClose: function () {
        var infoClose = document.createElement("div");
        infoClose.style.width = "100%";
        infoClose.style.position = "relative";
        infoClose.style.top = "0px";
        infoClose.style.left = "0px";
        infoClose.style.marginBottom = "30px";
        var closeButton = document.createElement("h2");
        closeButton.appendChild(document.createTextNode("X"));
        closeButton.style.textAlign = "right";
        closeButton.style.marginRight = "10px";
        SMSMap.addTextTouchEffect(closeButton);
        closeButton.onclick = function () {
            document.getElementById("wrapper").removeChild(document.getElementById("infoDiv"))
        };
        infoClose.appendChild(closeButton);

        return infoClose;
    },

    /**
     *   addTextTouchEffect
     *   Adds an effect to the text that is called when a button is touched on a phone. Any text-based element can
     *   be passed into the function and the effect will be added. This is a utility function to ensure all elements have
     *   the same effect for consistency
     *
     *   @param el - the text element the touch effects should be added to
     **/
    addTextTouchEffect: function (el) {
        el.ontouchstart = function () {
            el.style.color = SMSMap.effectColor;
        }
        el.ontouchend = function () {
            el.style.color = SMSMap.textColor;
        }
    },

    /**
     *   filterStates
     *   filters the coopData based on an input string
     *
     *   @param stateString - the state abbreviation you would like to filter.
     **/
    filterStates: function (stateString) {
        SMSMap.clearMap();
        //SMSMap.mapPoints = [];
        for (i = 0; i < SMSMap.coopData.length; i++) {
            if (SMSMap.coopData[i].state == stateString || stateString == "All") {
                SMSMap.createPoint(SMSMap.coopData[i].lat, SMSMap.coopData[i].long, i, true);
            }
        }
    },

    clearMap: function(){
        for( var i=0; i<SMSMap.mapPoints.length; i++ ){
            SMSMap.mapPoints[i].setMap(null);
        }
        SMSMap.mapPoints = [];
    },

    /**
     *   drawControls
     *   Creates the control div and adds the necessary filters that we need
     **/
    drawControls: function () {
        var controlDiv = document.createElement("div");
        controlDiv.id = "controls";
        controlDiv.style.width = "100%";
        controlDiv.style.height = "10%";
        controlDiv.style.backgroundColor = SMSMap.backgroundColor;
        controlDiv.style.position = "absolute";
        controlDiv.style.bottom = "0px";
        controlDiv.style.zIndex = "100";
        var stateFilter = document.createElement("select");
        stateFilter.style.marginLeft = "10%";

        var states = SMSMap.createStateList();
        var stateSelect;
        for (i = 0; i < states.length; i++) {
            stateSelect = document.createElement("option");
            stateSelect.value = states[i];
            stateSelect.appendChild(document.createTextNode(states[i]));
            stateFilter.appendChild(stateSelect);
        }
        stateFilter.onchange = function () {
            SMSMap.filterStates(stateFilter.options[stateFilter.selectedIndex].value);
            SMSMap.drawPoints();
        }
        controlDiv.appendChild(stateFilter);
        document.getElementById("wrapper").appendChild(controlDiv);
    },

    /**
     *   createStateList
     *   Creates the dropdown list of states based on which states are in the data.
     **/
    createStateList: function () {
        var stateArray = [];
        stateArray.push("All");
        for (i = 0; i < SMSMap.coopData.length; i++) {
            if (stateArray.indexOf(SMSMap.coopData[i].state) === -1 && SMSMap.coopData[i].state != undefined) {
                stateArray.push(SMSMap.coopData[i].state);
            }
        }
        stateArray.sort();
        return stateArray;
    },

    //Note: change this to whatever data is required for the map to function
    coopData: [
        {
            city: "Albany",
            state: "NY",
            lat: 42.659178,
            long: -73.784792,
            country: "US",
            companies: [
                {
                    name: "Dogtown",
                    website: "http://www.google.com"
                },
                {
                    name: "Peabody",
                    website: "http://www.google.com"
                }
            ]
        },
        {
            city: "Alexandria",
            state: "VA",
            lat: 38.817311,
            long: -77.069165,
            country: "US",
            companies: [
                {
                    name: "Connect",
                    website: "http://www.nhl.com"
                }
            ]
        },
        {
            city: "Burbank",
            state: "CA",
            lat: 34.1820104,
            long: -118.3252111,
            country: "US",
            companies: []
        },
        {
            city: "Genoa",
            state: undefined,
            lat: 44.4466289,
            long: 9.0732185,
            country: "IT",
            companies: []
        },
        {
            city: "Ahmedabad, Gujarat",
            state: undefined,
            lat: 23.267848,
            long: 72.546784,
            country: "IN",
            companies: []
        },
        {
            city: "Barcelona",
            state: undefined,
            lat: 41.39479,
            long: 2.1487679,
            country: "SP",
            companies: []
        },
        {
            city: "Baton Rouge",
            state: "LA",
            lat: 30.44147,
            long: -91.1114,
            country: "US",
            companies: []
        },
        {
            city: "Boston",
            state: "MA",
            lat: 42.3133735,
            long: -71.0574944,
            country: "US",
            companies: []
        },
        {
            city: "Brooklyn",
            state: "NY",
            lat: 40.645244,
            long: -73.9449975,
            country: "US",
            companies: []
        },
        {
            city: "Brooksville",
            state: "FL",
            lat: 28.5312985,
            long: -82.3945239,
            country: "US",
            companies: []
        },
        {
            city: "Browns Summit",
            state: "NC",
            lat: 36.2151122,
            long: -79.7105239,
            country: "US",
            companies: []
        },
        {
            city: "Buffalo",
            state: "NY",
            lat: 42.8962389,
            long: -78.854702,
            country: "US",
            companies: []
        },
        {
            city: "Cambridge",
            state: "MA",
            lat: 42.3783903,
            long: -71.1129096,
            country: "US",
            companies: []
        },
        {
            city: "Canandaigua",
            state: "NY",
            lat: 42.8902259,
            long: -77.2795375,
            country: "US",
            companies: []
        },
        {
            city: "Carlstadt",
            state: "NJ",
            lat: 40.828056,
            long: -74.066597,
            country: "US",
            companies: []
        },
        {
            city: "Chapel Hill",
            state: "NC",
            lat: 35.920959,
            long: -79.0392909,
            country: "US",
            companies: []
        },
        {
            city: "Charlotte",
            state: "NC",
            lat: 35.2031535,
            long: -80.8395259,
            country: "US",
            companies: []
        },
        {
            city: "Chennai",
            state: undefined,
            lat: 13.0475604,
            long: 80.2089535,
            country: "IN",
            companies: []
        },
        {
            city: "Cleveland",
            state: "OH",
            lat: 41.4949425,
            long: -81.7060165,
            country: "US",
            companies: []
        },
        {
            city: "Clifton",
            state: "NJ",
            lat: 40.85968,
            long: -74.157769,
            country: "US",
            companies: []
        },
        {
            city: "Cupertino",
            state: "CA",
            lat: 37.30925,
            long: -122.0436444,
            country: "US",
            companies: []
        },
        {
            city: "Dayton",
            state: "OH",
            lat: 39.7794904,
            long: -84.2021574,
            country: "US",
            companies: []
        },
        {
            city: "Deerfield Beach",
            state: "FL",
            lat: 26.3011291,
            long: -80.1223944,
            country: "US",
            companies: []
        },
        {
            city: "Denver",
            state: "CO",
            lat: 39.7643389,
            long: -104.8551114,
            country: "US",
            companies: []
        },
        {
            city: "Detroit",
            state: "MI",
            lat: 42.352711,
            long: -83.099205,
            country: "US",
            companies: []
        },
        {
            city: "Doral",
            state: "FL",
            lat: 25.8186434,
            long: -80.3541725,
            country: "US",
            companies: []
        },
        {
            city: "East Longmeadow",
            state: "MA",
            lat: 42.0617615,
            long: -72.4987905,
            country: "US",
            companies: []
        },
        {
            city: "Elma",
            state: "NY",
            lat: 42.8556376,
            long: -78.6412165,
            country: "US",
            companies: []
        },
        {
            city: "Emmaus",
            state: "PA",
            lat: 40.5367669,
            long: -75.4993955,
            country: "US",
            companies: []
        },
        {
            city: "Englewood Cliffs",
            state: "NJ",
            lat: 40.8834512,
            long: -73.9514409,
            country: "US",
            companies: []
        },
        {
            city: "Exton",
            state: "PA",
            lat: 40.0300984,
            long: -75.6306254,
            country: "US",
            companies: []
        },
        {
            city: "Fairport",
            state: "NY",
            lat: 43.0976165,
            long: -77.442104,
            country: "US",
            companies: []
        },
        {
            city: "Falls Church",
            state: "VA",
            lat: 38.8860207,
            long: -77.17232,
            country: "US",
            companies: []
        },
        {
            city: "Fishers",
            state: "NY",
            lat: 43.0074411,
            long: -77.4645656,
            country: "US",
            companies: []
        },
        {
            city: "Fiskeville",
            state: "RI",
            lat: 41.7396848,
            long: -71.5411964,
            country: "US",
            companies: []
        },
        {
            city: "Foster City",
            state: "CA",
            lat: 37.5546438,
            long: -122.266135,
            country: "US",
            companies: []
        },
        {
            city: "Geneva",
            state: "NY",
            lat: 42.8641494,
            long: -76.9871144,
            country: "US",
            companies: []
        },
        {
            city: "Guayaquil",
            state: undefined,
            lat: -2.1523874,
            long: -79.9799096,
            country: "EC",
            companies: []
        },
        {
            city: "Hauppauge",
            state: "NY",
            lat: 40.8260808,
            long: -73.2100419,
            country: "US",
            companies: []
        },
        {
            city: "Heidelberg",
            state: undefined,
            lat: 49.4057284,
            long: 8.6836142,
            country: "GM",
            companies: []
        },
        {
            city: "Henrietta",
            state: "NY",
            lat: 43.0417684,
            long: -77.6069355,
            country: "US",
            companies: []
        },
        {
            city: "Hillside",
            state: "IL",
            lat: 41.86488,
            long: -87.8979776,
            country: "US",
            companies: []
        },
        {
            city: "Holley",
            state: "NY",
            lat: 43.2262771,
            long: -78.0294155,
            country: "US",
            companies: []
        },
        {
            city: "Hunt Valley",
            state: "MD",
            lat: 39.4850281,
            long: -76.6564796,
            country: "US",
            companies: []
        },
        {
            city: "Independence",
            state: "KS",
            lat: 37.2337491,
            long: -95.7193345,
            country: "US",
            companies: []
        },
        {
            city: "Indianapolis",
            state: "IN",
            lat: 39.7797845,
            long: -86.13275,
            country: "US",
            companies: []
        },
        {
            city: "Lake Hamilton",
            state: "FL",
            lat: 28.047837,
            long: -81.628012,
            country: "US",
            companies: []
        },
        {
            city: "Lake Success",
            state: "NY",
            lat: 40.7699795,
            long: -73.7092375,
            country: "US",
            companies: []
        },
        {
            city: "Leesburg",
            state: "VA",
            lat: 39.101473,
            long: -77.5581537,
            country: "US",
            companies: []
        },
        {
            city: "Lexington",
            state: "MA",
            lat: 42.448081,
            long: -71.2250886,
            country: "US",
            companies: []
        },
        {
            city: "Lincolnwood",
            state: "IL",
            lat: 42.0061304,
            long: -87.735759,
            country: "US",
            companies: []
        },
        {
            city: "Liverpool",
            state: "NY",
            lat: 43.1055563,
            long: -76.2107762,
            country: "US",
            companies: []
        },
        {
            city: "London",
            state: undefined,
            lat: 51.5286416,
            long: -0.1090537,
            country: "UK",
            companies: []
        },
        {
            city: "Macedon",
            state: "NY",
            lat: 43.0682815,
            long: -77.3035809,
            country: "US",
            companies: []
        },
        {
            city: "Melbourne",
            state: "FL",
            lat: 28.1174805,
            long: -80.6552775,
            country: "US",
            companies: []
        },
        {
            city: "Miamisberg",
            state: "OH",
            lat: 39.6291079,
            long: -84.2713685,
            country: "US",
            companies: []
        },
        {
            city: "Morristown",
            state: "NJ",
            lat: 40.7992959,
            long: -74.4788125,
            country: "US",
            companies: []
        },
        {
            city: "Munich",
            state: undefined,
            lat: 48.1549107,
            long: 11.5418357,
            country: "GM",
            companies: []
        },
        {
            city: "New Hartford",
            state: "NY",
            lat: 43.0711265,
            long: -75.2880404,
            country: "US",
            companies: []
        },
        {
            city: "New York",
            state: "NY",
            lat: 40.7033127,
            long: -73.979681,
            country: "US",
            companies: []
        },
        {
            city: "Oceanside",
            state: "CA",
            lat: 33.2259756,
            long: -117.3172837,
            country: "US",
            companies: []
        },
        {
            city: "Orlando",
            state: "FL",
            lat: 28.4811689,
            long: -81.36875,
            country: "US",
            companies: []
        },
        {
            city: "Owings Mills",
            state: "MD",
            lat: 39.4148304,
            long: -76.7963144,
            country: "US",
            companies: []
        },
        {
            city: "Pawtucket",
            state: "RI",
            lat: 41.8773989,
            long: -71.378075,
            country: "US",
            companies: []
        },
        {
            city: "Philadelphia",
            state: "PA",
            lat: 40.0047528,
            long: -75.1180329,
            country: "US",
            companies: []
        },
        {
            city: "Pittsburgh",
            state: "PA",
            lat: 40.4313684,
            long: -79.9805005,
            country: "US",
            companies: []
        },
        {
            city: "Pittsford",
            state: "NY",
            lat: 43.0904724,
            long: -77.5182095,
            country: "US",
            companies: []
        },
        {
            city: "Pleasantville",
            state: "NY",
            lat: 41.1405599,
            long: 41.1405599,
            country: "US",
            companies: []
        },
        {
            city: "Port Chester",
            state: "NY",
            lat: 41.0087702,
            long: -73.6674749,
            country: "US",
            companies: []
        },
        {
            city: "Poughkeepsie",
            state: "NY",
            lat: 41.6939296,
            long: -73.916076,
            country: "US",
            companies: []
        },
        {
            city: "Providence",
            state: "RI",
            lat: 41.8169925,
            long: -71.4217954,
            country: "US",
            companies: []
        },
        {
            city: "Rochester",
            state: "NY",
            lat: 43.1854658,
            long: -77.6165028,
            country: "US",
            companies: []
        },
        {
            city: "Rolesville",
            state: "NC",
            lat: 35.9216965,
            long: -78.4605318,
            country: "US",
            companies: []
        },
        {
            city: "Rush",
            state: "NY",
            lat: 42.9967929,
            long: -77.6263575,
            country: "US",
            companies: []
        },
        {
            city: "San Diego",
            state: "CA",
            lat: 32.8245525,
            long: -117.0951632,
            country: "US",
            companies: []
        },
        {
            city: "Sanford",
            state: "NC",
            lat: 35.47998,
            long: -79.1685912,
            country: "US",
            companies: []
        },
        {
            city: "Sao Paulo",
            state: undefined,
            lat: -22.5455869,
            long: -48.6355227,
            country: "BR",
            companies: []
        },
        {
            city: "Schenectady",
            state: "NY",
            lat: 42.8035645,
            long: -73.9381435,
            country: "US",
            companies: []
        },
        {
            city: "Shelton",
            state: "CT",
            lat: 41.315646,
            long: -73.134981,
            country: "US",
            companies: []
        },
        {
            city: "Southhampton",
            state: undefined,
            lat: 50.919458,
            long: -1.399463,
            country: "UK",
            companies: []
        },
        {
            city: "St Louis",
            state: "MO",
            lat: 38.6531004,
            long: -90.243462,
            country: "US",
            companies: []
        },
        {
            city: "St Louis Park",
            state: "MN",
            lat: 44.949134,
            long: -93.3695775,
            country: "US",
            companies: []
        },
        {
            city: "Staten Island",
            state: "NY",
            lat: 40.5646056,
            long: -74.1468185,
            country: "US",
            companies: []
        },
        {
            city: "Sterling",
            state: "MA",
            lat: 42.439341,
            long: -71.7752272,
            country: "US",
            companies: []
        },
        {
            city: "Susquehanna",
            state: "PA",
            lat: 41.9443405,
            long: -75.6047556,
            country: "US",
            companies: []
        },
        {
            city: "Sussex",
            state: "WI",
            lat: 43.1348104,
            long: -88.2245625,
            country: "US",
            companies: []
        },
        {
            city: "Swarkstone",
            state: undefined,
            lat: 52.8547105,
            long: -1.453636,
            country: "UK",
            companies: []
        },
        {
            city: "Syracuse",
            state: "NY",
            lat: 43.0352339,
            long: -76.13928,
            country: "US",
            companies: []
        },
        {
            city: "Trumball",
            state: "CT",
            lat: 41.2597284,
            long: -73.2073488,
            country: "US",
            companies: []
        },
        {
            city: "Upper Marlboro",
            state: "MD",
            lat: 38.8169588,
            long: -76.7549455,
            country: "US",
            companies: []
        },
        {
            city: "Valencia",
            state: "CA",
            lat: 34.4560442,
            long: -118.5713357,
            country: "US",
            companies: []
        },
        {
            city: "Vero Beach",
            state: "FL",
            lat: 27.6451991,
            long: -80.3968735,
            country: "US",
            companies: []
        },
        {
            city: "Victor",
            state: "NY",
            lat: 42.982593,
            long: -77.4104524,
            country: "US",
            companies: []
        },
        {
            city: "Waco",
            state: "TX",
            lat: 31.5533291,
            long: -97.187578,
            country: "US",
            companies: []
        },
        {
            city: "Washington",
            state: "DC",
            lat: 38.8993488,
            long: -77.0145665,
            country: "US",
            companies: []
        },
        {
            city: "Webster",
            state: "NY",
            lat: 43.2136959,
            long: -77.4197983,
            country: "US",
            companies: []
        },
        {
            city: "West Henrietta",
            state: "NY",
            lat: 43.0328691,
            long: -77.6784291,
            country: "US",
            companies: []
        },
        {
            city: "Westport",
            state: "CT",
            lat: 41.1322861,
            long: -73.3427614,
            country: "US",
            companies: []
        },
        {
            city: "Wilmington",
            state: "DE",
            lat: 39.729902,
            long: -75.5294844,
            country: "US",
            companies: []
        },
        {
            city: "Wimberley",
            state: "TX",
            lat: 29.977357,
            long: -98.0876514,
            country: "US",
            companies: []
        },
        {
            city: "Wisconsin Rapids",
            state: "WI",
            lat: 44.3880725,
            long: -89.8124844,
            country: "US",
            companies: []
        }
    ],

    mapStyle: [
        {
            "featureType":"all",
            "elementType":"all",
            "stylers": [
                {"visibility":"simplified"}
            ]
        },
        {
            "featureType":"administrative",
            "elementType":"labels.text.fill",
            "stylers": [
                {"color":"#444444"}
            ]
        },
        {
            "featureType":"landscape",
            "elementType":"all",
            "stylers": [
                {"color":"#f2f2f2"}
            ]
        },
        {
            "featureType":"poi",
            "elementType":"all",
            "stylers": [
                {"visibility":"off"}
            ]
        },
        {
            "featureType":"road",
            "elementType":"all",
            "stylers": [
                {"saturation":-100},
                {"lightness":45}
            ]
        },
        {
            "featureType":"road.highway",
            "elementType":"all",
            "stylers": [
                {"visibility":"simplified"}
            ]
        },
        {
            "featureType":"road.arterial",
            "elementType":"labels.icon",
            "stylers": [
                {"visibility":"off"}
            ]
        },
        {
            "featureType":"transit",
            "elementType":"all",
            "stylers": [
                {"visibility":"off"}
            ]
        },
        {
            "featureType":"water",
            "elementType":"all",
            "stylers": [
                {"color":"#34495e"},
                {"visibility":"on"}
            ]
        }
    ]
}
