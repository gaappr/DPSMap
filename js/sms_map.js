var SMSMap = {
    //Note: change this to whatever data is required for the map to function
    coopData:[
        {
            city:"Albany",
            state:"NY",
            lat: 42.659178,
            long: -73.784792,
            country: "US",
            companies:[
                {
                    name:"Dogtown",
                    website:"http://www.google.com"
                },
                {
                    name:"Peabody",
                    website:"http://www.google.com"
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
                    name:"Connect",
                    website:"http://www.nhl.com"
                }
            ]
        },
        {
            city:"Burbank",
            state:"CA",
            lat: 34.1820104,
            long: -118.3252111,
            country: "US",
            companies:[]
        },
        {
            city:"Genoa",
            state:undefined,
            lat:44.4466289,
            long:9.0732185,
            country:"IT",
            companies:[]
        }
    ],
    
    /**
    *   initiateMap
    *   Called initially to setup the map - there will be no points on the map initially
    **/
    initiateMap: function(){
        $('#smsMap').gmap(
            {   'zoom' : 3,
                'center': '38.611563, -98.545487',
                'mapTypeControl' : false, 
                'navigationControl' : false,
                'streetViewControl' : false,
        });
    },

    /**
    *   drawMap
    *   parses through the coopData array and adds points to the map with the help of the drawPoint function.
    **/
    drawMap:function(){
        $('#smsMap').gmap().bind('init', function() {
            for(var i=0; i<SMSMap.coopData.length; i++){
                //Retrieve marker info due to the deferred callback below
                SMSMap.drawPoint( SMSMap.coopData[i].lat, SMSMap.coopData[i].long, i );
            }
        });
    },
    
    /**
    *   drawPoint
    *   This will actually draw a point on the map and add information about that point to the
    *   map. Also sets up an onclick listener to enable the viewing of the information in the map
    *
    *   @param lat - the latitude of the point you would like to draw
    *   @param long - the longitude of the point you would like to draw
    *   @param arrayLocation - the location in the coopArray you are pulling this point from
    **/
    drawPoint:function(lat, long, arrayLocation){
        $('#smsMap').gmap('addMarker', {'position':lat + "," + long, 'bounds':false}).click(function(){
            SMSMap.drawInfoDiv(arrayLocation);
            
            //$('#smsMap').gmap('openInfoWindow', {'content':SMSMap.createCityInfo(arrayLocation)}, this);
        });  
    },
    
    /**
    *   setWrapperSize
    *   A utility function to set the size of the map relative to the size of the screen it is being displayed on.
    **/
    setWrapperSize:function(){
        $("#wrapper").width( $(window).width() );
        $("#wrapper").height( $(window).height() );
    },
    
    /**
    *   drawInfoDiv
    *   Actually draws the information regarding each city. This function specifically handles the creation of
    *   the box and the associated styling
    *   
    *   @param arrayLoc - The array location within coopData array that we are going to display on the screen
    **/
    drawInfoDiv:function(arrayLoc){
        var infoDiv = document.createElement("div");
        infoDiv.id = "infoDiv";
        
        //All of the styling is done here
        infoDiv.style.width = $(window).width() + "px";
        infoDiv.style.height = $(window).height() + "px";
        infoDiv.style.position = "absolute";
        infoDiv.style.left = "0px";
        infoDiv.style.top = "0px";
        infoDiv.style.zIndex = 100;
        infoDiv.style.overflow="scroll";
        infoDiv.style.backgroundColor = "rgba(0,0,0,0.75)";
        infoDiv.style.color = "white";
        
        //All of the content added to the div below
        infoDiv.appendChild(SMSMap.createCityName(arrayLoc));
        infoDiv.appendChild(SMSMap.createInfoClose());
        
        if( SMSMap.coopData[arrayLoc].companies.length > 0 ){
            for( var i=0; i<SMSMap.coopData[arrayLoc].companies.length; i++ ){
                var companyLink = document.createElement("a");
                companyLink.href = SMSMap.coopData[arrayLoc].companies[i].website;
                companyLink.style.textDecoration = "none";
                companyLink.style.color = "white";
                companyLink.style.fontSize = "30px";
                companyLink.style.textAlign = "center";
                companyLink.appendChild(document.createTextNode(SMSMap.coopData[arrayLoc].companies[i].name));
                companyLink.style.display = "block";  
                infoDiv.appendChild(companyLink);
            }
        }
        else{
            var defaultPara = document.createElement("p");
            defaultPara.style.textAlign = "center";
            defaultPara.appendChild( document.createTextNode( 
                "We're sorry, we can't find the company names, but someone did go on co-op in this city!") );
            infoDiv.appendChild( defaultPara );
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
    createCityName:function(arrayLoc){
        var cityName = document.createElement("h1");
        var city = SMSMap.coopData[arrayLoc].city;
        var state = SMSMap.coopData[arrayLoc].state;
        var country = SMSMap.coopData[arrayLoc].country;
        var cityString = city;
        if( state ){
            cityString += ", " + state;   
        }
        else if( country ){
            cityString += ", " + country;   
        }
        cityName.appendChild( document.createTextNode(cityString) );
        cityName.style.fontSize = "45px";
        cityName.style.textAlign = "center";
        return cityName;
    },
    
    /**
    *   createInfoClose
    *   Creates that button the will remove the infoDiv. This funcation also assigns and handles the necessary events
    *   associated with the close button.
    **/
    createInfoClose:function(){
        var infoClose = document.createElement("div");
        var closeButton = document.createElement("h2");
        closeButton.appendChild( document.createTextNode("X") );
        closeButton.onclick = function(){ document.getElementById("wrapper").removeChild( document.getElementById("infoDiv") ) };
        infoClose.appendChild(closeButton);
        infoClose.style.position = "fixed";
        infoClose.style.right = "0px";
        infoClose.style.top = "0px";
        
        return infoClose;
    }
}