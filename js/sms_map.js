var SMSMap = {

    backgroundColor: "rgba(0,0,0,0.75)",
    textColor: "white",
    effectColor: "#777777",
    filterVisible: false,
    infoDivVisible: false,
    pointClicked: false,

    pastFilteredStates: ["All"],
    currentFilteredStates: [],

    //Change the following two objects when a new image is added
    defaultIcon: {
      'url': './images/p5_green.png',
      'size': new google.maps.Size(32, 60),
      'origin': new google.maps.Point(0, 0),
      'anchor': new google.maps.Point(16, 60)
    },
    selectedIcon: {
      'url': './images/p5_lightblue.png',
      'size': new google.maps.Size(32, 60),
      'origin': new google.maps.Point(0, 0),
      'anchor': new google.maps.Point(16, 60)
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
        'styles': SMSMap.mapStyle,
        //'zoomControl': false,
      };

      SMSMap.map = new google.maps.Map(document.getElementById('sms-map'), mapOptions);

      //waits till document is loaded to call listener binding function
      document.addEventListener("DOMContentLoaded", function(event) {
        SMSMap.addListeners();
      });
    },



    addListeners: function(){
      var closeButton = document.getElementsByClassName("close");
      var filterDisplayButton = document.getElementById("filter-display");
      var filterCalc = document.getElementById("filter-calc");

      //zoom change event listener for entire map
      google.maps.event.addListener(SMSMap.map, "zoom_changed", function(){
        if(SMSMap.pointClicked){
          SMSMap.map.setCenter(SMSMap.pointClicked.position);
          SMSMap.map.panBy(0, -120);
        }
      });

      //touch drag event listener for entire map
      google.maps.event.addListener(SMSMap.map, "drag", function(){
        SMSMap.hideInfo();
        if(SMSMap.filterVisible === true){
          SMSMap.doFilter();
        }
      });

      //touch 'click' event listener that does the same as above for entire map
      google.maps.event.addListener(SMSMap.map, "click", function(){
        SMSMap.hideInfo();
        if(SMSMap.filterVisible === true){
          SMSMap.doFilter();
        }
      });

      //SMSMap.addTextTouchEffect(closeButton);

      for( var i = 0; i < closeButton.length; i++){
        if(closeButton[i].className === "close info"){
          console.log("brap");
          closeButton[i].onclick = function () {
            SMSMap.hideInfo();
          };
        }else{
          console.log("bananas");
          closeButton[i].onclick = function () {
            SMSMap.doFilter();
          };
        }
      }

      filterDisplayButton.onclick = function() {
        SMSMap.doFilter();
        SMSMap.hideInfo();
      }

      filterCalc.onclick = function(){
        console.log(this);
        console.log(this.id);
        if(SMSMap.currentFilteredStates.length > 0 && this.id === "filter-calc-ready"){
          SMSMap.doFilter();

          SMSMap.filterStates(SMSMap.currentFilteredStates);
          SMSMap.drawPoints();

          for(var i = SMSMap.pastFilteredStates.length - 1; i > -1; i--){
            console.log(i);
            console.log(SMSMap.pastFilteredStates[i]);
            SMSMap.pastFilteredStates[i].className = "list";
            SMSMap.pastFilteredStates.pop();
          }

          for(var i = SMSMap.currentFilteredStates.length - 1; i > -1; i--){
            console.log(i);
            console.log(SMSMap.currentFilteredStates[i]);
            SMSMap.currentFilteredStates[i].className = "past";
            SMSMap.pastFilteredStates.push(SMSMap.currentFilteredStates[i]);
            SMSMap.currentFilteredStates.pop();
          }
          this.id = "filter-calc";
        }
      }

      //also save a reference to the filter display button and div for later use
      SMSMap.filter = document.getElementById("filter");
      SMSMap.filterDisplayButton = filterDisplayButton;
    },



    hideInfo: function(){
      if(SMSMap.pointClicked){
        SMSMap.pointClicked.setIcon(SMSMap.defaultIcon);
      }

      SMSMap.pointClicked = false;

      if(SMSMap.infoDivVisible){
        SMSMap.infoDiv.style.pointerEvents = "none";
        SMSMap.infoDiv.style.opacity = 0;
        SMSMap.infoDivVisible = false;
      }
    },



    doFilter: function(){
      console.log("doing that filter!!!");
      if(SMSMap.filterVisible){
        SMSMap.filter.style.pointerEvents = "none";
        SMSMap.filter.style.opacity = 0;
        SMSMap.filterVisible = false;

        SMSMap.filterDisplayButton.style.opacity = 1;
        SMSMap.filterDisplayButton.style.pointerEvents = "auto";
      }else{
        SMSMap.filter.style.pointerEvents = "auto";
        SMSMap.filter.style.opacity = 1;
        SMSMap.filterVisible = true;

        SMSMap.filterDisplayButton.style.opacity = 0;
        SMSMap.filterDisplayButton.style.pointerEvents = "none";
      }
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
        console.log("---------");
        console.log(lat);
        console.log(long);
        console.log(arrayLocation);
        console.log(bounds);
        console.log("--------");


        var point = {
            'position': new google.maps.LatLng(lat,long),
            'bounds': bounds,
            'animation': google.maps.Animation.DROP,
            'icon': SMSMap.defaultIcon,
        };
        var googlePoint = new google.maps.Marker( point );

        google.maps.event.addListener(googlePoint,'click',function(){
          var currentZoom = SMSMap.map.getZoom();

          if(SMSMap.pointClicked){
            SMSMap.pointClicked.setIcon(SMSMap.defaultIcon);
          }

          if(SMSMap.filterVisible){
            SMSMap.doFilter();
          }

          SMSMap.pointClicked = this;
          this.setIcon(SMSMap.selectedIcon);

          SMSMap.map.setZoom(currentZoom < 6 ? 6 : currentZoom);
          SMSMap.map.setCenter(new google.maps.LatLng(lat, long));
          SMSMap.map.panBy(0, -120);

          SMSMap.drawInfoDiv(arrayLocation);
        });

        SMSMap.mapPoints.push(googlePoint);
    },



    drawPoints: function(){
        for( var i=0; i<SMSMap.mapPoints.length; i++ ){
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
        //make local variable to make shorter
        var infoDiv = document.getElementById("info-div");
        var cityHolder = document.getElementById("city-holder");
        var companiesHolder = document.getElementById("companies-holder");

        //make sure replacable elements in infoDiv are clear of any previously
        //displayed content (i.e. the city name and company list)
        var replace = document.getElementsByClassName("replace")
        for (var i = 0; i < replace.length; i++){
          replace[i].innerHTML = "";
        }

        //set reference to infoDiv as property of main object for later use
        SMSMap.infoDiv = infoDiv;

        //make infoDiv visible (default css opacity is 0)
        //infoDiv.style.zIndex = 1;
        SMSMap.infoDiv.style.pointerEvents = "auto";
        infoDiv.style.opacity = 1;

        //record the fact that infoDiv is now visible in the main object property
        SMSMap.infoDivVisible = true;

        //infoDiv.appendChild(SMSMap.createInfoClose());
        cityHolder.appendChild(SMSMap.createCityName(arrayLoc));

        if (SMSMap.filteredArray[arrayLoc].companies.length > 0) {

            for (var i = 0; i < SMSMap.filteredArray[arrayLoc].companies.length; i++) {
                var companyLink = document.createElement("a");
                companyLink.className = "company-link";
                companyLink.href = SMSMap.filteredArray[arrayLoc].companies[i].website;

                companyLink.appendChild(document.createTextNode(SMSMap.filteredArray[arrayLoc].companies[i].name));
                //SMSMap.addTextTouchEffect(companyLink);
                companiesHolder.appendChild(companyLink);
            }
        } else {
            var defaultPara = document.createElement("p");
            defaultPara.style.textAlign = "center";
            defaultPara.appendChild(document.createTextNode(
                "We're sorry, we can't find the company names, but someone did go on co-op in this city!"));
            infoDiv.appendChild(defaultPara);
        }
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

        return cityName;
    },



    /**
     *   createInfoClose
     *   Creates that button the will remove the infoDiv. This function also assigns and handles the necessary events
     *   associated with the close button.
     **/
     /*
    createInfoClose: function () {
        var closeButton = document.createElement("div");
        closeButton.id = "info-close";

        SMSMap.addTextTouchEffect(closeButton);

        closeButton.onclick = function () {
            SMSMap.hideInfo();
        };

        SMSMap.infoDiv.appendChild(closeButton);

        return closeButton;
    },
*/


    /**
     *   addTextTouchEffect
     *   Adds an effect to the text that is called when a button is touched on a phone. Any text-based element can
     *   be passed into the function and the effect will be added. This is a utility function to ensure all elements have
     *   the same effect for consistency
     *
     *   @param el - the text element the touch effects should be added to
     **/
    /*
    addTextTouchEffect: function (el) {
        el.ontouchstart = function () {
            el.style.color = SMSMap.effectColor;
        }
        el.ontouchend = function () {
            el.style.color = SMSMap.textColor;
        }
    },*/



    /**
     *   filterStates
     *   filters the coopData based on an input string
     *
     *   @param stateString - the state abbreviation you would like to filter.
     **/
    filterStates: function (filteredArr) {
        SMSMap.clearMap();

        //SMSMap.mapPoints = [];
        for(var a = 0; a < filteredArr.length; a++){
          stateString = filteredArr[a].value;
          for (i = 0; i < SMSMap.coopData.length; i++) {
              //console.log(SMSMap.coopData[i].state);
              //console.log(stateString);
              if (SMSMap.coopData[i].state == stateString || stateString == "All") {
                  console.log("MATCH");
                  SMSMap.createPoint(SMSMap.coopData[i].lat, SMSMap.coopData[i].long, i, true);
              }
          }
        }

        console.log(SMSMap.mapPoints);
        SMSMap.filterPosition();//stateString);
    },



    clearMap: function(){
        SMSMap.pointClicked = false;

        SMSMap.hideInfo();

        for( var i=0; i<SMSMap.mapPoints.length; i++ ){
            SMSMap.mapPoints[i].setMap(null);
        }

        SMSMap.mapPoints = [];
    },



    /**
     * filterPosition
     *   Changes the center and zoom of the map object based on the filter selection
     *
     * @param stateString - string, user filter selection (two letter state
     *                      abreviation or "All" to include all points)
     */
    filterPosition: function (){//(stateString){
      var tempLat = 0;
      var tempLng = 0;

      for(var i = 0; i < SMSMap.mapPoints.length; i++){
        tempLat += SMSMap.mapPoints[i].position.G;
        tempLng += SMSMap.mapPoints[i].position.K;
      }

      avgLat = tempLat / SMSMap.mapPoints.length;
      avgLng = tempLng / SMSMap.mapPoints.length;

      //if(stateString === "All"){
      //  SMSMap.map.setCenter(new google.maps.LatLng(38.611563, -98.545487));
      //  SMSMap.map.setZoom(3);
      //}else{
        SMSMap.map.setCenter(new google.maps.LatLng(avgLat, avgLng));
        SMSMap.map.setZoom(3);
      //}
    },



    /**
     *   drawControls
     *   Creates the control div and adds the necessary filters that we need
     **/


    drawControls: function () {
        var stateFilter = document.getElementById("filter-state-div");

        var states = SMSMap.createStateList();
        var stateP;
        for (i = 0; i < states.length; i++) {
            stateP = document.createElement("p");
            stateP.className = "list";
            stateP.value = states[i];
            stateP.appendChild(document.createTextNode(states[i]));
            stateFilter.appendChild(stateP);

            if(SMSMap.pastFilteredStates.indexOf(states[i]) > -1){
              SMSMap.pastFilteredStates[SMSMap.pastFilteredStates.indexOf(states[i])] = stateP;
              stateP.className = "past";
            }

            stateP.onclick = function(){
              var filterNow = document.getElementById("filter-calc");
              var filterNowReady = document.getElementById("filter-calc-ready");

              if(this.className === "list"){
                this.className = "current";
                SMSMap.currentFilteredStates.push(this);

                if(filterNow){
                  filterNow.id = "filter-calc-ready";
                  filterNowReady = filterNow;
                  filterNow = null;
                }
              }else{
                var tempIndex = SMSMap.currentFilteredStates.indexOf(this);

                if(tempIndex > -1){
                  SMSMap.currentFilteredStates.splice(tempIndex, 1);
                }

                this.className = "list";
              }

              if(SMSMap.currentFilteredStates.length < 1 && filterNowReady){
                filterNowReady.id = "filter-calc";
                filterNow = filterNowReady;
                filterNowReady = null;
              }

              /*if(SMSMap.currentFilteredStates.length > 0 && filterNowReady){
                filterNowReady.onclick = function(){
                  SMSMap.doFilter();

                  SMSMap.filterStates(SMSMap.currentFilteredStates[0].value);
                  SMSMap.drawPoints();

                  for(var i = SMSMap.pastFilteredStates.length - 1; i > -1; i--){
                    console.log(i);
                    console.log(SMSMap.pastFilteredStates[i]);
                    SMSMap.pastFilteredStates[i].className = "list";
                    SMSMap.pastFilteredStates.pop();
                  }

                  for(var i = SMSMap.currentFilteredStates.length - 1; i > -1; i--){
                    console.log(i);
                    console.log(SMSMap.currentFilteredStates[i]);
                    SMSMap.currentFilteredStates[i].className = "past";
                    SMSMap.pastFilteredStates.push(SMSMap.currentFilteredStates[i]);
                    SMSMap.currentFilteredStates.pop();
                  }
                  filterNowReady.id = "filter-calc";

                }
              }*/
            }
        }

        //stateFilter.onchange = function () {
        //    SMSMap.filterStates(stateFilter.options[stateFilter.selectedIndex].value);
        //    SMSMap.drawPoints();
        //}

        //controlDiv.appendChild(stateFilter);
        //document.getElementById("wrapper").appendChild(controlDiv);
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
            city:"Albany",
            state:"NY",
            lat: 42.659178,
            long: -73.784792,
            country: "US",
            companies:[
                {
                    name:"NYS Dept of Taxation & Finance",
                    website:"http://www.tax.ny.gov/"
                },
                {
                    name:"Fort Orange Press Inc",
                    website:"http://www.fortorangepress.com/index.php",
                    industry:"Print"
                }
            ]
        },
        {
            city:"Alexandria",
            state:"VA",
            lat: 38.817311,
            long: -77.069165,
            country: "US",
            companies:[
                {
                    name:"DigiLink Inc",
                    website:"http://digilink-inc.com/",
                    industry:"Print"
                },
                {
                    name:"Global Printing  (Global Thinking)",
                    website:"http://www.globalprinting.com/",
                    industry:"Print"
                }
            ]
        },
        {
            city:"Burbank",
            state:"CA",
            lat: 34.1820104,
            long: -118.3252111,
            country: "US",
            companies:[
              {
                    name:"Dolby Laboratories Inc",
                    website:"http://www.dolby.com/us/en/index.html",
                    industry:"Consumer Products"
                }
            ]
        },
        {
            city:"Genoa",
            state:undefined,
            lat:44.4466289,
            long:9.0732185,
            country:"IT",
            companies:[
              {
                    name:"De Ferrari"
                }
            ]
        },
          {
            city:"Ahmedabad, Gujarat",
            state:undefined,
            lat:23.267848,
            long:72.546784,
            country:"IN",
            companies:[
              {
                    name:"Carton Manufacturing"
                }
            ]
        },
          {
            city:"Barcelona",
            state:undefined,
            lat:41.39479,
            long:2.1487679,
            country:"SP",
            companies:[
              {
                    name:"Press Print",
                    industry:"Print"
                }
            ]
        },
        {
            city:"Baton Rouge",
            state:"LA",
            lat:30.44147,
            long:-91.1114,
            country:"US",
            companies:[
              {
                    name:"Louisiana School for the Deaf",
                    website:"http://www.lalsd.org/",
                    industry:"Education"
                }
            ]
        },
          {
            city:"Boston",
            state:"MA",
            lat:42.3133735,
            long:-71.0574944,
            country:"US",
            companies:[
              {
                    name:"Grand Lodge of Masons in Massachusetts",
                    website:"http://www.massfreemasonry.org/"
                },
                {
                    name:"Jobs for the Future",
                    website:"http://www.jff.org/"
                },
                {
                    name:"Mullen",
                    website:"http://www.mullenloweus.com/",
                    industry:"Agency"
                },
                {
                    name:"SapientNitro",
                    website:"http://www.sapientnitro.com/en-us.html#home",
                    industry:"Agency"
                },
                {
                    name:"Sullivan & McLaughlin Companies, Inc",
                    website:"http://www.sullymac.com/"
                }
            ]
        },
        {
            city:"Brooklyn",
            state:"NY",
            lat:40.645244,
            long:-73.9449975,
            country:"US",
            companies:[
              {
                    name:"New York Popular Inc",
                    website:"http://www.popularityproducts.com/"
                }
            ]
        },
        {
            city:"Brooksville",
            state:"FL",
            lat:28.5312985,
            long:-82.3945239,
            country:"US",
            companies:[
              {
                    name:"Accuform Sign",
                    website:"http://www.accuform.com/",
                    industry:"Print"
                }
            ]
        },
        {
            city:"Browns Summit",
            state:"NC",
            lat:36.2151122,
            long:-79.7105239,
            country:"US",
            companies:[
              {
                    name:"Banknote Corporation of America",
                    website:"http://www.banknote.com/"
                }
            ]
        },
         {
            city:"Buffalo",
            state:"NY",
            lat:42.8962389,
            long:-78.854702,
            country:"US",
            companies:[
              {
                    name:"Flexo Transparent Inc",
                    website:"http://www.flexotransparent.com/",
                    industry:"Print"
                },
                {
                    name:"LocalEdge Media",
                    website:"https://www.hearst.com/newspapers/localedge",
                    industry:"Publications/News/Books"
                }
            ]
        },
         {
            city:"Cambridge",
            state:"MA",
            lat:42.3783903,
            long:-71.1129096,
            country:"US",
            companies:[
              {
                    name:"Aerva",
                    website:"http://www.aerva.com/",
                    industry:"Mobile/Software"
                }
            ]
        },
        {
            city:"Canandaigua",
            state:"NY",
            lat:42.8902259,
            long:-77.2795375,
            country:"US",
            companies:[
              {
                    name:"Messenger Post Media",
                    website:"http://www.mpnnow.com/",
                    industry:"Publications/News/Books"
                }
            ]
        },
        {
            city:"Carlstadt",
            state:"NJ",
            lat:40.828056,
            long:-74.066597,
            country:"US",
            companies:[
              {
                    name:"Imtech Graphics Inc",
                    website:"http://www.imtechgraphics.com/",
                    industry:"Print"
                }
            ]
        },
      {
            city:"Chapel Hill",
            state:"NC",
            lat:35.920959,
            long:-79.0392909,
            country:"US",
            companies:[
              {
                    name:"The Around Campus Group",
                    website:"http://www.aroundcampusgroup.com/",
                    industry:"Agency"
                }
            ]
        },
        {
            city:"Charlotte",
            state:"NC",
            lat:35.2031535,
            long:-80.8395259,
            country:"US",
            companies:[
              {
                    name:"Practis Inc",
                    website:"https://practisinc.com/",
                    industry:"Agency"
                }
            ]
        },
       {
            city:"Chennai",
            state:undefined,
            lat:13.0475604,
            long:80.2089535,
            country:"IN",
            companies:[
              {
                    name:"Hi-Tech Offset",
                    website:"http://hitechoffset.com/",
                    industry:"Print"
                }
            ]
        },
        {
            city:"Cleveland",
            state:"OH",
            lat:41.4949425,
            long:-81.7060165,
            country:"US",
            companies:[
              {
                    name:"Lite Em Up Bag Toss",
                    website:"http://www.liteemupbagtoss.com/",
                    industry:"Consumer Products"
                }
            ]
        },
        {
            city:"Clifton",
            state:"NJ",
            lat:40.85968,
            long:-74.157769,
            country:"US",
            companies:[
              {
                    name:"Premium Color Graphics",
                    website:"http://www.premiumcolor.com/",
                    industry:"Print"
                }
            ]
        },
        {
            city:"Cupertino",
            state:"CA",
            lat:37.30925,
            long:-122.0436444,
            country:"US",
            companies:[
              {
                    name:"IO Integration Inc",
                    website:"http://www.iointegration.com/"
                }
            ]
        },
        {
            city:"Dayton",
            state:"OH",
            lat:39.7794904,
            long:-84.2021574,
            country:"US",
            companies:[
              {
                    name:"Standard Register",
                    website:"http://standardregister.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Deerfield Beach",
            state:"FL",
            lat:26.3011291,
            long:-80.1223944,
            country:"US",
            companies:[
              {
                    name:"Sun-Sentinel",
                    website:"http://www.sun-sentinel.com/",
                    industry:"Publications/News/Books"
                }
            ]
        },
         {
            city:"Denver",
            state:"CO",
            lat:39.7643389,
            long:-104.8551114,
            country:"US",
            companies:[
              {
                    name:"Mobile Pulse",
                    website:"http://mobilepulse.com/",
                    industry:"Mobile/Software"
                }
            ]
        },
        {
            city:"Detroit",
            state:"MI",
            lat:42.352711,
            long:-83.099205,
            country:"US",
            companies:[
              {
                    name:"Jack Morton Worldwide",
                    website:"http://www.jackmorton.com/",
                    industry:"Agency"
                }
            ]
        },
         {
            city:"Doral",
            state:"FL",
            lat:25.8186434,
            long:-80.3541725,
            country:"US",
            companies:[
              {
                    name:"Univision Interactive Media Inc",
                    website:"http://www.univision.com/",
                    industry:"Agency"
                }
            ]
        },
         {
            city:"East Longmeadow",
            state:"MA",
            lat:42.0617615,
            long:-72.4987905,
            country:"US",
            companies:[
              {
                    name:"Hasbro",
                    website:"http://www.hasbro.com/en-us",
                    industry:"Consumer Products"
                }
            ]
        },
        {
            city:"Elma",
            state:"NY",
            lat:42.8556376,
            long:-78.6412165,
            country:"US",
            companies:[
              {
                    name:"WNY FLASH",
                    website:"http://www.wnyflash.com/home/"
                }
            ]
        },
        {
            city:"Emmaus",
            state:"PA",
            lat:40.5367669,
            long:-75.4993955,
            country:"US",
            companies:[
              {
                    name:"Rodale Publishing",
                    website:"http://www.rodaleinc.com/",
                    industry:"Publications/News/Books"
                }
            ]
        },
         {
            city:"Englewood Cliffs",
            state:"NJ",
            lat:40.8834512,
            long:-73.9514409,
            country:"US",
            companies:[
              {
                    name:"AdAsia Communications",
                    website:"http://www.adasia-us.com/",
                    industry:"Agency"
                },
                {
                    name:"Menasha Packaging Company",
                    website:"http://www.menashapackaging.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Exton",
            state:"PA",
            lat:40.0300984,
            long:-75.6306254,
            country:"US",
            companies:[
              {
                    name:"Oberthur Technologies of America Corp",
                    website:"http://www.oberthur.com/?lang=en",
                    industry:"Mobile/Software"
                }
            ]
        },
         {
            city:"Fairport",
            state:"NY",
            lat:43.0976165,
            long:-77.442104,
            country:"US",
            companies:[
              {
                    name:"CooperVision, Inc.",
                    website:"http://coopervision.com/",
                    industry:"Consumer Products"
                },
                {
                    name:"Fix Spindelman Brovitz & Goldman"
                },
                {
                    name:"Soleo Communications Inc",
                    website:"http://www.soleo.com/",
                    industry:"Vender"
                }
            ]
        },
        {
            city:"Falls Church",
            state:"VA",
            lat:38.8860207,
            long:-77.17232,
            country:"US",
            companies:[
              {
                    name:"Composition Systems Incorporated (CSI)",
                    website:"http://csi2.com/",
                    industry:"Print"
                }
            ]
        },
          {
            city:"Fishers",
            state:"NY",
            lat:43.0074411,
            long:-77.4645656,
            country:"US",
            companies:[
              {
                    name:"New York Apple Association Inc",
                    website:"http://www.nyapplecountry.com/"
                }
            ]
        },
        {
            city:"Fiskeville",
            state:"RI",
            lat:41.7396848,
            long:-71.5411964,
            country:"US",
            companies:[
              {
                    name:"Arkwright Inc",
                    website:"http://www.sihlusa.com/"
                }
            ]
        },
         {
            city:"Foster City",
            state:"CA",
            lat:37.5546438,
            long:-122.266135,
            country:"US",
            companies:[
              {
                    name:"Electronics For Imaging (EFI)",
                    website:"http://www.efi.com/"
                }
            ]
        },
        {
            city:"Geneva",
            state:"NY",
            lat:42.8641494,
            long:-76.9871144,
            country:"US",
            companies:[
              {
                    name:"Zotos International",
                    website:"http://www.zotos.com/",
                    industry:"Consumer Products"
                }
            ]
        },
        {
            city:"Guayaquil",
            state:undefined,
            lat:-2.1523874,
            long:-79.9799096,
            country:"EC",
            companies:[
              {
                    name:"POLIGRaFICA C.A.",
                    website:"http://www.poligrafica.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Hauppauge",
            state:"NY",
            lat:40.8260808,
            long:-73.2100419,
            country:"US",
            companies:[
              {
                    name:"Disc Graphics",
                    website:"http://www.discgraphics.com/",
                }
            ]
        },
        {
            city:"Heidelberg",
            state:undefined,
            lat:49.4057284,
            long:8.6836142,
            country:"GM",
            companies:[
              {
                    name:"Heidelberger Druckmaschinen AG",
                    website:"https://www.heidelberg.com/us/en/index.jsp",
                    industry:"Vender"
                }
            ]
        },
        {
            city:"Henrietta",
            state:"NY",
            lat:43.0417684,
            long:-77.6069355,
            country:"US",
            companies:[
              {
                    name:"Consolidated Graphics - Tucker Printers",
                    website:"http://www.tuckerprinters.com/",
                    industry:"Print"
                }
            ]
        },
        {
            city:"Hillside",
            state:"IL",
            lat:41.86488,
            long:-87.8979776,
            country:"US",
            companies:[
              {
                    name:"Darwill Inc",
                    website:"http://www.darwill.com/",
                    industry:"Print"
                }
            ]
        },
        {
            city:"Holley",
            state:"NY",
            lat:43.2262771,
            long:-78.0294155,
            country:"US",
            companies:[
              {
                    name:"QuiltWoman.com",
                    website:"http://quiltwoman.com/",
                    industry:"Consumer Products"
                }
            ]
        },
         {
            city:"Hunt Valley",
            state:"MD",
            lat:39.4850281,
            long:-76.6564796,
            country:"US",
            companies:[
              {
                    name:"The Sheridan Group",
                    website:"http://www.sheridan.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Independence",
            state:"KS",
            lat:37.2337491,
            long:-95.7193345,
            country:"US",
            companies:[
              {
                    name:"Independence Public Library",
                    website:"http://iplks.org/"
                }
            ]
        },
        {
            city:"Indianapolis",
            state:"IN",
            lat:39.7797845,
            long:-86.13275,
            country:"US",
            companies:[
              {
                    name:"Fineline Printing Group",
                    website:"http://finelineprintinggroup.com/",
                    industry:"Print"
                }
            ]
        },
        {
            city:"Lake Hamilton",
            state:"FL",
            lat:28.047837,
            long:-81.628012,
            country:"US",
            companies:[
              {
                    name:"Extreme Graphics",
                    website:"http://www.extremegx.com/"
                }
            ]
        },
        {
            city:"Lake Success",
            state:"NY",
            lat:40.7699795,
            long:-73.7092375,
            country:"US",
            companies:[
              {
                    name:"Canon USA Inc",
                    website:"https://www.usa.canon.com/cusa/home",
                    industry:"Vender"
                }
            ]
        },
        {
            city:"Leesburg",
            state:"VA",
            lat:39.101473,
            long:-77.5581537,
            country:"US",
            companies:[
              {
                    name:"FCI Federal",
                    website:"http://www.fcifederal.com/"
                }
            ]
        },
        {
            city:"Lexington",
            state:"MA",
            lat:42.448081,
            long:-71.2250886,
            country:"US",
            companies:[
              {
                    name:"MIT Lincoln Laboratory",
                    website:"https://www.ll.mit.edu/"
                },
                {
                    name:"Vistaprint",
                    website:"http://www.vistaprint.com",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Lincolnwood",
            state:"IL",
            lat:42.0061304,
            long:-87.735759,
            country:"US",
            companies:[
              {
                    name:"Phoenix International Publications Inc",
                    website:"http://www.phoenixip.com/",
                    industry:"Publications/News/Books"
                }
            ]
        },
         {
            city:"Liverpool",
            state:"NY",
            lat:43.1055563,
            long:-76.2107762,
            country:"US",
            companies:[
              {
                    name:"Raymour & Flanigan Field Support Ctr",
                    website:"http://www.raymourflanigan.com/",
                    industry:"Consumer Products"
                }
            ]
        },
         {
            city:"London",
            state:undefined,
            lat:51.5286416,
            long:-0.1090537,
            country:"UK",
            companies:[
              {
                    name:"Schon! Magazine",
                    website:"http://www.schonmagazine.com/",
                    industry:"Publications/News/Books"
                }
            ]
        },
         {
            city:"Macedon",
            state:"NY",
            lat:43.0682815,
            long:-77.3035809,
            country:"US",
            companies:[
              {
                    name:"Berry Plastics",
                    website:"http://www.berryplastics.com/",
                    industry:"Print"
                },
                {
                    name:"W A Krapf Inc",
                    website:"https://www.magnatag.com/",
                    industry:"Consumer Products"
                }
            ]
        },
         {
            city:"Melbourne",
            state:"FL",
            lat:28.1174805,
            long:-80.6552775,
            country:"US",
            companies:[
              {
                    name:"Palmas Printing Inc",
                    website:"http://palmasprinting.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Miamisberg",
            state:"OH",
            lat:39.6291079,
            long:-84.2713685,
            country:"US",
            companies:[
              {
                    name:"Innomark Communications",
                    website:"http://www.innomarkcom.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Morristown",
            state:"NJ",
            lat:40.7992959,
            long:-74.4788125,
            country:"US",
            companies:[
              {
                    name:"RevHealth",
                    website:"http://www.revhealth.com/",
                    industry:"Agency"
                }
            ]
        },
        {
            city:"Munich",
            state:undefined,
            lat:48.1549107,
            long:11.5418357,
            country:"GM",
            companies:[
              {
                    name:"Fogra Forschungsgesellschaft Druck e. V.",
                    website:"http://www.fogra.org/",
                    industry:"Vender"
                }
            ]
        },
         {
            city:"New Hartford",
            state:"NY",
            lat:43.0711265,
            long:-75.2880404,
            country:"US",
            companies:[
              {
                    name:"Trainor Associates",
                    website:"http://www.trainor.com/",
                    industry:"Agency"
                }
            ]
        },
        {
            city:"New York",
            state:"NY",
            lat:40.7033127,
            long:-73.979681,
            country:"US",
            companies:[
              {
                    name:"ABC Imaging",
                    website:"http://portal.abcimaging.com/",
                    industry:"Print"
                },
                {
                    name:"AGENCYSACKS",
                    website:"http://www.agencysacks.com/",
                    industry:"Agency"
                },
                {
                    name:"BBDO",
                    website:"https://www.bbdo.com/"
                    },
                    {

                    name:"Busted Tees",
                    website:"http://www.bustedtees.com/",
                    industry:"Consumer Products"
                },
                {
                    name:"CBS",
                    website:"http://www.cbs.com/"
                    },
                    {

                    name:"Centron",
                    website:"http://centronpublicrelations.com/",
                    industry:"Agency"
                },
                 {

                    name:"ChinaSprout",
                    website:"http://www.chinasprout.com/",
                    industry:"Publications/News/Books"
                },
                {

                    name:"Conde Nast Publications",
                    website:"http://www.condenast.com/",
                    industry:"Publications/News/Books"
                },
                {

                    name:"DPCI (Database Publishing Consultants)",
                    website:"http://www.dpci.com/",
                    industry:"Mobile/Software"
                },
                 {

                    name:"Duggal Visual Solutions Inc",
                    website:"http://www.duggal.com/",
                    industry:"Print"
                },
                {

                    name:"Ensemble",
                    website:"http://letsensemble.com/",
                    industry:"Agency"
                },
                {

                    name:"Guggenheim Museum",
                    website:"http://www.guggenheim.org/"
                },
                 {

                    name:"Hearst Magazines",
                    website:"http://www.hearst.com/magazines",
                    industry:"Publications/News/Books"
                },
                {

                    name:"Initiative",
                    website:"http://initiative.com/",
                    industry:"Agency"
                },
                 {

                    name:"Magnani Caruso Dutton",
                    website:"https://mcdpartners.com/",
                    industry:"Agency"
                },
                 {

                    name:"Marvel Worldwide Inc",
                    website:"http://marvel.com/"
                },
                {

                    name:"MEG Group, Ltd.",
                    website:"http://www.meggroup.net/",
                    industry:"Print"
                },
                {

                    name:"MTV News",
                    website:"http://www.mtv.com/news/"
                },
                 {

                    name:"One Source Visual Marketing Solutions",
                    website:"https://segd.org/tags/one-source-visual-marketing-solutions"
                },
                 {

                    name:"Peeq Media",
                    website:"http://www.peeqmedia.com/",
                    industry:"Print"
                },
                 {

                    name:"Tag Worldwide",
                    website:"http://www.tagworldwide.com/en",
                    industry:"Agency"
                },
                 {

                    name:"Tastemade",
                    website:"https://www.tastemade.com/",
                    industry:"Mobile/Software"
                },
                 {

                    name:"Villageprint",
                    website:"http://www.villageprint.com/",
                    industry:"Print"
                }
            ]
        },
        {
            city:"Oceanside",
            state:"CA",
            lat:33.2259756,
            long:-117.3172837,
            country:"US",
            companies:[
              {

                    name:"Angel Printing",
                    website:"http://angelprint.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Orlando",
            state:"FL",
            lat:28.4811689,
            long:-81.36875,
            country:"US",
            companies:[
              {

                    name:"The Matlet Group",
                    website:"http://www.thematletgroup.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Owings Mills",
            state:"MD",
            lat:39.4148304,
            long:-76.7963144,
            country:"US",
            companies:[
              {

                    name:"Lion Brothers Company Inc",
                    website:"http://www.lionbrothers.com/"
                }
            ]
        },
        {
            city:"Pawtucket",
            state:"RI",
            lat:41.8773989,
            long:-71.378075,
            country:"US",
            companies:[
              {

                    name:"Hasbro",
                    website:"http://www.hasbro.com",
                    industry:"Consumer Products"
                },
                {

                    name:"TwoBolt",
                    website:"http://www.twobolt.com/",
                    industry:"Agency"
                }
            ]
        },
          {
            city:"Philadelphia",
            state:"PA",
            lat:40.0047528,
            long:-75.1180329,
            country:"US",
            companies:[
                {

                    name:"Digitas Health",
                    website:"http://www.digitashealth.com/",
                    industry:"Agency"
                }
            ]
        },
         {
            city:"Pittsburgh",
            state:"PA",
            lat:40.4313684,
            long:-79.9805005,
            country:"US",
            companies:[
                {

                    name:"Matthews International Corp",
                    website:"http://matw.com/"
                }
            ]
        },
        {
            city:"Pittsford",
            state:"NY",
            lat:43.0904724,
            long:-77.5182095,
            country:"US",
            companies:[
               {

                    name:"In T'Hutch Ltd",
                    website:"http://www.inthutch.com/"
                },
                 {

                    name:"Martino Flynn",
                    website:"http://www.martinoflynn.com/",
                    industry:"Agency"
                },
                 {

                    name:"Serius Marketing",
                    website:"http://www.seriusmarketing.com/",
                    industry:"Agency"
                }
            ]
        },
          {
            city:"Pleasantville",
            state:"NY",
            lat:41.1405599,
            long:-73.793271,
            country:"US",
            companies:[
              {

                    name:"VariDirect Solutions",
                    website:"http://varidirect.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Port Chester",
            state:"NY",
            lat:41.0087702,
            long:-73.6674749,
            country:"US",
            companies:[
              {

                    name:"AI Friedman",
                    website:"http://www.aifriedman.com/",
                    industry:"Consumer Products"
                }
            ]
        },
        {
            city:"Poughkeepsie",
            state:"NY",
            lat:41.6939296,
            long:-73.916076,
            country:"US",
            companies:[
                {

                    name:"Net Publications Inc.",
                    website:"http://www.netpub.net/",
                    industry:"Print"
                }
            ]
        },
        {
            city:"Providence",
            state:"RI",
            lat:41.8169925,
            long:-71.4217954,
            country:"US",
            companies:[
              {

                    name:"Hasbro",
                    website:"http://www.hasbro.com",
                    industry:"Consumer Products"
                }
            ]
        },
        {
            city:"Rochester",
            state:"NY",
            lat:43.1854658,
            long:-77.6165028,
            country:"US",
            companies:[
              {

                    name:"Archer Communications",
                    website:"http://www.archercom.com/",
                    industry:"Agency"
                },
                {

                    name:"Beau Productions - Frontier Field"
                },
                {

                    name:"Best Buy",
                    website:"http://www.bestbuy.com/",
                    industry:"Consumer Products"
                },
                {

                    name:"Butler/Till Media",
                    website:"http://butlertill.com/",
                    industry:"Agency"
                },
                 {

                    name:"Catalyst Direct Inc.",
                    website:"http://catalystinc.com/",
                    industry:"Agency"
                },
                {

                    name:"Centering Tools",
                    website:"http://www.centeringtools.com/"
                },
                {

                    name:"City Blue Imaging Services",
                    website:"http://www.cityblueimaging.com/",
                    industry:"Print"
                },
                {

                    name:"Clear Channel Radio",
                    website:"http://www.iheartmedia.com/Pages/Home.aspx"
                },
                {

                    name:"Cohber Digital Marketing Solutions Group",
                    website:"http://www.cohber.com",
                    industry:"Print"
                },
                {

                    name:"Cornell's Jewelers",
                    website:"http://www.cornellsjewelers.com/",
                    industry:"Consumer Products"
                },
                 {

                    name:"Daymon Worldwide",
                    website:"http://www.daymon.com/",
                    industry:"Agency"
                },
                {

                    name:"Democrat and Chronicle",
                    website:"http://www.democratandchronicle.com/",
                    industry:"Publications/News/Books"
                },
                 {

                    name:"Diamond Packaging",
                    website:"http://www.diamondpackaging.com/",
                    industry:"Print"
                },
                {

                    name:"Discovering Deaf Worlds",
                    website:"http://www.discoveringdeafworlds.org/"
                },
                  {

                    name:"EagleDream Technologies",
                    website:"http://www.eagledream.com/"
                },
                {

                    name:"Eastman Kodak Co - Mt Read Blvd",
                    website:"http://www.kodak.com/ek/US/en/corp/default.htm",
                    industry:"Consumer Products"
                },
                 {

                    name:"Empire State Games Foundation",
                    website:"http://www.empirestategames.org/"
                },
                 {

                    name:"Envative",
                    website:"http://www.envative.com/",
                    industry:"Mobile/Software"
                },
                 {

                    name:"EPi Printing and Finishing",
                    website:"http://www.epiprinting.com/",
                    industry:"Print"
                },
                 {

                    name:"Excellus BlueCross BlueShield",
                    website:"https://www.excellusbcbs.com/wps/portal/xl"
                },
                {

                    name:"Fanshoes Inc"
                },
                {

                    name:"Flower City Group",
                    website:"http://www.flowercityprinting.com/",
                    indsutry:"Print"
                },
                {

                    name:"Hammer Packaging",
                    website:"http://hammerpackaging.com/",
                    indsutry:"Print"
                },
                 {

                    name:"Harter Secrest & Emery LLP",
                    website:"http://www.hselaw.com/"
                },
                 {

                    name:"Mercury Print Productions",
                    website:"http://www.mercuryprint.com/",
                    indsutry:"Print"
                },
                {

                    name:"Mosaically",
                    website:"http://mosaically.com/"
                },
                {

                    name:"Nothnagle Realtors",
                    website:"http://www.nothnagle.com/"
                },
                 {

                    name:"Pad Business Forms",
                    website:"http://www.padbf.com/pad/Default.asp",
                    indsutry:"Print"
                },
                 {

                    name:"Partners + Napier",
                    website:"http://www.partnersandnapier.com/",
                    indsutry:"Agency"
                },
                {

                    name:"Poseidon Systems",
                    website:"http://www.poseidonsys.com/"
                },
                 {

                    name:"Post Central Inc.",
                    website:"http://www.partnersandnapier.com/"
                },
                 {

                    name:"RES Exhibit Services",
                    website:"http://www.res-exhibits.com/"
                },
                {

                    name:"RIT - Center for Residence Life",
                    website:"https://www.rit.edu/studentaffairs/reslife/"
                },
                {

                    name:"RIT - College of Imaging Arts & Science",
                    website:"https://cias.rit.edu/"
                },
                {

                    name:"RIT - College of Liberal Arts",
                    website:"https://www.rit.edu/cla/"
                },
                {

                    name:"RIT - Development and Alumni Relations",
                    website:"https://www.rit.edu/development/giving/"
                },
                {

                    name:"RIT - Government & Community Relations",
                    website:"https://www.rit.edu/gcr/"
                },
                {

                    name:"RIT - Imaging Science",
                    website:"https://www.cis.rit.edu/"
                },
                {

                    name:"RIT - Information & Technology Services",
                    website:"https://www.rit.edu/its/"
                },
                {

                    name:"RIT - ITS/Technical Support",
                    website:"https://www.rit.edu/its/help"
                },
                {

                    name:"RIT - Office of the Registrar",
                    website:"https://www.rit.edu/academicaffairs/registrar/"
                },
                {

                    name:"RIT - Printing Applications Laboratory",
                    website:"http://printlab.rit.edu/"
                },
                {

                    name:"RIT - Research Computing",
                    website:"http://rc.rit.edu/"
                },
                {

                    name:"RIT - Saunders College of Business",
                    website:"http://saunders.rit.edu/"
                },
                {

                    name:"RIT - School of Media Sciences",
                    website:"http://cias.rit.edu/schools/media-sciences"
                },
                {

                    name:"RIT - The Wallace Center",
                    website:"https://wallacecenter.rit.edu/"
                },
                 {

                    name:"RIT - University Publications",
                    website:"https://www.rit.edu/upub/"
                },
                {

                    name:"RIT-NTID - Arts & Imaging Studies (AIS)",
                    website:"http://www.ntid.rit.edu/vcs"
                },
                {

                    name:"Roc Rooms & Rentals LLC",
                    website:"http://www.ntid.rit.edu/vcs"
                },
                {

                    name:"Rochester City School District",
                    website:"http://www.rcsdk12.org/rcsd",
                    industry:"Print"
                },
                {

                    name:"Rochester Regional Health System",
                    website:"http://www.rochesterregionalhealth.org/"
                },
                {

                    name:"Rochester Software Associates",
                    website:"http://www.rocsoft.com/",
                    industry:"Mobile/Software"
                },
                {

                    name:"Spinergy Media",
                    website:"http://www.spinergymedia.com/",
                    industry:"Consumer Products"
                },
                 {

                    name:"TLF Graphics Inc",
                    website:"http://www.tlfgraphics.com/",
                    industry:"Print"
                },
                {

                    name:"University of Rochester",
                    website:"https://www.rochester.edu/"
                },
                {

                    name:"Valpak Rochester",
                    website:"https://www.valpakrochester.com/",
                    industry:"Agency"
                },
                 {

                    name:"Wegmans Food Markets - Calkins Rd",
                    website:"http://www.wegmans.com/",
                    industry:"Consumer Products"
                },
                 {

                    name:"Xerox Corporation - Roch-S Clinton",
                    website:"http://www.xerox.com/",
                    industry:"Vender"
                },
                {

                    name:"XMPie Inc",
                    website:"http://www.xmpie.com/"
                }
            ]
        },
          {
            city:"Rolesville",
            state:"NC",
            lat:35.9216965,
            long:-78.4605318,
            country:"US",
            companies:[
              {

                    name:"Computype",
                    website:"http://www.computype.com/"
                }
            ]
        },
         {
            city:"Rush",
            state:"NY",
            lat:42.9967929,
            long:-77.6263575,
            country:"US",
            companies:[
              {

                    name:"SPSmedical Supply",
                    website:"http://www.spsmedical.com/"
                }
            ]
        },
          {
            city:"San Diego",
            state:"CA",
            lat:32.8245525,
            long:-117.0951632,
            country:"US",
            companies:[
              {

                    name:"Intuit",
                    website:"https://www.intuit.com/",
                    industry:"Consumer Products"
                }
            ]
        },
         {
            city:"Sanford",
            state:"NC",
            lat:35.47998,
            long:-79.1685912,
            country:"US",
            companies:[
              {

                    name:"PolySi Technologies",
                    website:"http://www.polysi.com/",
                    industry:"Vender"
                }
            ]
        },
        {
            city:"Sao Paulo",
            state:undefined,
            lat:-22.5455869,
            long:-48.6355227,
            country:"BR",
            companies:[
              {

                    name:"Heidelberger Druckmaschinen",
                    website:"https://www.heidelberg.com/us/en/index.jsp",
                    industry:"Vender"
                }
            ]
        },
        {
            city:"Schenectady",
            state:"NY",
            lat:42.8035645,
            long:-73.9381435,
            country:"US",
            companies:[
              {

                    name:"LeChase Construction",
                    website:"http://www.lechase.com/"
                }
            ]
        },
         {
            city:"Shelton",
            state:"CT",
            lat:41.315646,
            long:-73.134981,
            country:"US",
            companies:[
              {

                    name:"CCL Label",
                    website:"http://www.ccllabel.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Southhampton",
            state:undefined,
            lat:50.8995249,
            long:50.8995249,
            country:"UK",
            companies:[
              {

                    name:"Ryan Edwards",
                    website:"http://www.ryanedwards.ca/",
                    industry:"Agency"
                }
            ]
        },
         {
            city:"St Louis",
            state:"MO",
            lat:38.6531004,
            long:-90.243462,
            country:"US",
            companies:[
              {

                    name:"Cultural Festival",
                    website:"http://www.culturalfestivals.com/"
                }
            ]
        },
         {
            city:"St Louis Park",
            state:"MN",
            lat:44.949134,
            long:-93.3695775,
            country:"US",
            companies:[
              {

                    name:"Japs-Olson Company",
                    website:"http://www.japsolson.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Staten Island",
            state:"NY",
            lat:40.5646056,
            long:-74.1468185,
            country:"US",
            companies:[
              {

                    name:"Valpak",
                    website:"https://www.valpak.com/"
                }
            ]
        },
          {
            city:"Sterling",
            state:"MA",
            lat:42.439341,
            long:-71.7752272,
            country:"US",
            companies:[
              {

                    name:"JMB Marketing",
                    website:"http://www.jmbmarketing.com/",
                    industry:"Agency"
                }

            ]
        },
        {
            city:"Susquehanna",
            state:"PA",
            lat:41.9443405,
            long:-75.6047556,
            country:"US",
            companies:[
              {

                    name:"Premier Bluestone Inc.",
                    website:"http://www.endlessmountainstone.com/"
                }
            ]
        },
        {
            city:"Sussex",
            state:"WI",
            lat:43.1348104,
            long:-88.2245625,
            country:"US",
            companies:[
              {

                    name:"Quad Graphics",
                    website:"https://www.qg.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Swarkstone",
            state:undefined,
            lat:52.8547105,
            long:-1.453636,
            country:"UK",
            companies:[
              {

                    name:"Bombadil Publishing",
                    website:"http://www.bombadilpublishing.com/",
                    industry:"Publications/News/Books"
                }
            ]
        },
        {
            city:"Syracuse",
            state:"NY",
            lat:43.0352339,
            long:-76.13928,
            country:"US",
            companies:[
              {

                    name:"Progressive Expert Consulting",
                    website:"https://www.pecinc.com/pages/home.aspx"
                },
                {

                    name:"Zoom Printing & Graphics",
                    website:"http://www.zoomprinting.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Trumball",
            state:"CT",
            lat:41.2597284,
            long:-73.2073488,
            country:"US",
            companies:[
               {

                    name:"St. Vincent's Special Needs",
                    website:"http://www.stvincentsspecialneeds.org/"
                },
                 {

                    name:"Unilever",
                    website:"http://www.unilever.com/",
                    industry:"Consumer Products"
                }
            ]
        },
         {
            city:"Upper Marlboro",
            state:"MD",
            lat:38.8169588,
            long:-76.7549455,
            country:"US",
            companies:[
                  {

                    name:"Linemark Printing Inc",
                    website:"http://www.linemark.com/",
                    industry:"Print"
                },
                {

                    name:"Zancan Press",
                    website:"http://zancanpress.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Valencia",
            state:"CA",
            lat:34.4560442,
            long:-118.5713357,
            country:"US",
            companies:[
               {

                    name:"Ryan Edwards Communications - Cunard",
                    website:"http://www.ryanedwards.ca/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Vero Beach",
            state:"FL",
            lat:27.6451991,
            long:-80.3968735,
            country:"US",
            companies:[
               {

                    name:"DHI",
                    industry:"Agency"
                }
            ]
        },
        {
            city:"Victor",
            state:"NY",
            lat:42.982593,
            long:-77.4104524,
            country:"US",
            companies:[
               {

                    name:"Cazbah",
                    website:"http://www.cazbah.net/",
                    industry:"Agency"
                }
            ]
        },
         {
            city:"Waco",
            state:"TX",
            lat:31.5533291,
            long:-97.187578,
            country:"US",
            companies:[
              {

                    name:"Packaging Corporation of America",
                    website:"http://www.packagingcorp.com/",
                    industry:"Print"
                }
            ]
        },
        {
            city:"Washington",
            state:"DC",
            lat:38.8993488,
            long:-77.0145665,
            country:"US",
            companies:[
              {

                    name:"Gallaudet University",
                    website:"https://www.gallaudet.edu/"
                },
                {

                    name:"National Public Radio (NPR)",
                    website:"http://www.npr.org/"
                },
                {

                    name:"Smithsonian Institution National Museum",
                    website:"http://www.mnh.si.edu/"
                }
            ]
        },
         {
            city:"Webster",
            state:"NY",
            lat:43.2136959,
            long:-77.4197983,
            country:"US",
            companies:[
              {

                    name:"Protected Images LLC",
                    website:"http://www.protectedimages.com/",
                    industry:"Vender"
                },
                {

                    name:"Technotic Media",
                    website:"http://technoticmedia.com/"
                },
                {

                    name:"Xerox Corporation - Graphic Communications Business Group",
                    website:"http://www.xerox.com/",
                    industry:"Vender"
                },
                {

                    name:"Xerox Corporation - Supervisors",
                    website:"http://www.xerox.com/",
                    industry:"Vender"
                }
            ]
        },
         {
            city:"West Henrietta",
            state:"NY",
            lat:43.0328691,
            long:-77.6784291,
            country:"US",
            companies:[
              {

                    name:"Retrotech Inc",
                    website:"http://www.retrotech.com/"
                }
            ]
        },
         {
            city:"Westport",
            state:"CT",
            lat:41.1322861,
            long:-73.3427614,
            country:"US",
            companies:[
              {

                    name:"Moffly Media",
                    website:"http://www.mofflymedia.com/"
                }
            ]
        },
          {
            city:"Wilmington",
            state:"DE",
            lat:39.729902,
            long:-75.5294844,
            country:"US",
            companies:[
              {

                    name:"Incite Solutions",
                    website:"http://www.inciteoffice.com/",
                    industry:"Mobile/Software"
                }
            ]
        },
         {
            city:"Wimberley",
            state:"TX",
            lat:29.977357,
            long:-98.0876514,
            country:"US",
            companies:[
              {

                    name:"Brown Printing Company",
                    website:"http://www.brownprn.com/",
                    industry:"Print"
                }
            ]
        },
         {
            city:"Wisconsin Rapids",
            state:"WI",
            lat:44.3880725,
            long:-89.8124844,
            country:"US",
            companies:[
              {

                    name:"NewPage Corporation Research",
                    website:"https://lander.versoco.com/"
                }
            ]
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
