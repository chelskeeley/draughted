const drafted = {};
drafted.dbKey = '03674b74502b4a884e8ac194a998c62e';
drafted.baseUrl = 'http://api.brewerydb.com/v2/';



drafted.events = () => {
    //listen for form submit
    $('form').on('submit', function(e){
        //prevent default
        e.preventDefault();
        //when the user searches a new brewery, clear the brewery AND beers area
        $('.breweryContent').empty();
        $('.breweryContent').removeClass('boxStyle');
        
        $('#accordion').empty();
        
        $('.breweryInfo').removeClass('breweryInfoStyle').empty();
        $('#map').removeClass('mapSizing');
        $('.breweryBeersContent').removeClass('boxStyle');
        $('.breweryBeersContent').removeClass('breweryBeersStyle');
        

        
        $('#map').empty();
        $('.wikiForm').empty();
        $('#wikiResults').empty();
        
        //validate the form, store the typed text from input
        drafted.validateLocation();
       
    });

    $('body').on('click', '.eachBrewery', function() {
        //when the user selects a brewery, clear the content area where beer will populate
        $('#accordion').empty();
        $('.breweryInfo').empty();
        //when the user clicks on a brewery, save the data-id attribute
        drafted.userChoice = $(this).attr('data-id');
        drafted.getBeers();
        drafted.displayBreweryInfo();
    });

    // WIKIPEDIA
    $('body').on('change','#beerStyle', function () {
        drafted.userStyleWiki = $(this).val();
        drafted.getStyleInfo(drafted.userStyleWiki);
    })
};

//validate function to make sure that city name is letters and spaces only
drafted.validateLocation = () => {
    const regex = new RegExp(/^([a-zA-Z]+(_[a-zA-Z]+)*)(\s([a-zA-Z]+(_[a-zA-Z]+)*))*$/gi);

    if (regex.test($('#userLocation').val())){
        drafted.location = $('#userLocation').val().toLowerCase();
        //pass user input into getBrewery function to make ajax request
        drafted.getBrewery(drafted.location);

    } else {
        alert('Please enter a city name, with no symbols, or spaces before or after.');
    }
}


drafted.getBrewery = (loc) =>{
    $.ajax({
        url: 'http://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: `${drafted.baseUrl}locations`,
            params: {
                key: '03674b74502b4a884e8ac194a998c62e',
                countryIsoCode: 'CA',
                format: 'json',
                locality: loc
            },
            xmlToJSON: false,
        }
    })
    .then(function(breweryResult){
        console.log(breweryResult)
        //filter out breweries that are not open to the public
        drafted.breweryArray = breweryResult.data.filter(function(value){
            return value.openToPublic == 'Y'
        })
        .map(eachBrewery => ({//returns a new array of brewery objects with new keys,and is saved to use the information in case brewery is selected to display further information
            id: eachBrewery.brewery.id,
            name: eachBrewery.brewery.name,
            url: eachBrewery.brewery.website,
            description: eachBrewery.brewery.description,
            longitude: eachBrewery.longitude,
            latitude: eachBrewery.latitude,
        }));
        
        drafted.breweryArray.forEach(eachBrewery =>{//goes through the array of breweries, and prints each to the page
            drafted.displayBreweries(eachBrewery);
        });
    })
    .fail(() => {
        alert(`I'm sorry, we cannot find any breweries in a location by that name. Please re-enter the city name, or choose another location. Cheers!`)
    })
}

drafted.displayBreweries = (eachBrewery) => {//to display breweries in selected city
    
    $('.breweryContent').addClass('boxStyle');

    let heading = $('<h3>').text(eachBrewery.name);
    let scrollAnchor = $('<a>').attr('href', '#second');
    let eachBreweryDiv = $('<div>').addClass('eachBrewery').attr('data-id', eachBrewery.id).append(heading);
    let container = scrollAnchor.append(eachBreweryDiv);
    $('.breweryContent').append(container);
    
    //TEST SCROLLING
    $.smoothScroll({
        speed: 1500,
        easing: 'swing',
        },
    '+=' + $(window).height(),
    );

    $('.breweryContent a').smoothScroll({
        speed: 1500,
        easing: 'swing'
    });

   
};

drafted.getBeers = () => {
    $.ajax({
        url: 'http://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: `${drafted.baseUrl}/brewery/${drafted.userChoice}/beers`,
            params: {
                key: '03674b74502b4a884e8ac194a998c62e',
                countryIsoCode: 'CA',
                format: 'json',
            },
            xmlToJSON: false,
        }
    }).then(function(beerResult){
        drafted.beersInfo = beerResult.data;

        if (drafted.beersInfo != undefined) {//if there is information on the beers available
            drafted.beersArray = drafted.beersInfo.map(eachBeer => ({//returns a new array of beer objects with new keys
                name: eachBeer.name,
                description: eachBeer.description,
            }));
            drafted.displayBeers(drafted.beersArray);

        } else {//if there is no information on the beers available, display message
            let noBeer = $('<h3>').text('I\'m sorry, this brewery has not listed their available beer. Please contact or visit them for some delicious brews!');
            $('#accordion').append(noBeer);
        }
    })
};


drafted.displayBeers = (beerArray) =>{//to show beers for selected brewery

    beerArray.forEach(beverage => {//loops through each beer to print it to page
        let beerText;
        //displays alternate message if no beer description
        if(beverage.description === undefined){
            beerText = $('<p>').text(`Uh oh, this brewery forgot to tell us exactly what kind of delicious this brew is. Maybe go try it and let us know!`)
        } else {
            beerText = $('<p>').text(beverage.description)
        };
        let beerHeader = $('<h3>').text(beverage.name);
        let beerDescription = $('<div>').append(beerText);
        $('#accordion').accordion().append(beerHeader).append(beerDescription).accordion("destroy").accordion({
            collapsible: true,
            active: false,
            heightStyle: 'content'
        });
    });
   

}


drafted.displayBreweryInfo =() => {
    $('.breweryBeersContent').addClass('boxStyle');
    $('.breweryBeersContent').addClass('breweryBeersStyle');
    

    //find the object inside breweryArray that contains the brewery id of the brewery the user clicked on, and save it 
    drafted.selectedBrewery = drafted.breweryArray.find(drafted.findSelectBrewery);
    let breweryDescription;
    //state an alternate message if there is no description for the brewery
    if (drafted.selectedBrewery.description === undefined){
        breweryDescription = $('<p>').text(`Whoops, this brewery forgot to write about how awesome they are! Maybe stop by and they can tell you in person! Cheers!`);
    } else{
        breweryDescription = $('<p>').text(drafted.selectedBrewery.description);
    }

    let breweryTitle = $('<h3>').text(drafted.selectedBrewery.name);
    let breweryUrl = $('<a>').attr('href', drafted.selectedBrewery.url).text(drafted.selectedBrewery.url);
    $('.breweryInfo').append(breweryTitle, breweryDescription, breweryUrl).addClass('breweryInfoStyle');
    //display google map of brewery
    initMap(drafted.selectedBrewery.latitude, drafted.selectedBrewery.longitude);
    
    //After we display brewery information, display the wiki option to select beer style
    drafted.displayBeerStyle();
    };

drafted.displayBeerStyle = () => {
    let wikiInfo = `
        <h3>Want to learn more about beer and impress your friends?</h3>
        <form action="">
            <label for="animal">Select a Topic Below:</label>
            <select name="beerStyle" id="beerStyle">
                <option value="ale">Ale</option>
                <option value="pilsner">Pilsner</option>
                <option value="india pale ale">IPA</option>
                <option value="wheat beer">Wheat Beer</option>
                <option value="lager">Lager</option>
            </select>
        </form>`
        // <div class="wikiResults" id="wikiResults">

        // </div>;
    $('.wikiForm').html(wikiInfo);
}

//creates map and sets marker to long/lat of selected brewery
function initMap(lon, lat) {
    $('#map').addClass('mapSizing');


    drafted.map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: lon, lng: lat },
        zoom: 14,
        //TEST SNAZZY
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#eca222"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "weight": 2
                    },
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#AA660E"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5d11b"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "lightness": 20
                    },
                    {
                        "saturation": -20
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#1f2d36"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "saturation": 25
                    },
                    {
                        "lightness": 25
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#fffcb5"
                    }
                ]
            }
        ]
        //END SNAZZY
    });
    
    drafted.mapMarker = new google.maps.Marker({
        position: { lat: lon, lng: lat },
        map: drafted.map,
        
    });
}

//selects the specific brewery object in brewery array by using the brewery id of the user selection
drafted.findSelectBrewery = (eachBreweryObject) =>{
    return eachBreweryObject.id === drafted.userChoice;
}


drafted.getStyleInfo = (style) => {
    $.ajax({
        //code for wikipedia API access courtesy of http://www.9bitstudios.com/2014/03/getting-data-from-the-wikipedia-api-using-jquery/
        type: "GET",
        url: `http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=${style}&callback=?`,
        contentType: "application/json; charset=utf-8",
        async: false,
        dataType: "json",
        success: function (data, textStatus, jqXHR){
            let markup = data.parse.text["*"];
            let blurb = $('<div></div>').html(markup);
            // remove links as they will not work
            blurb.find('a').each(function () { $(this).replaceWith($(this).html()); });
            // remove any references
            blurb.find('sup').remove();
            // remove cite error
            blurb.find('.mw-ext-cite-error').remove();
            $('#wikiResults').html($(blurb).find('p'));
        }
    })
    .fail(function(){
        alert('Sorry, this information is not available at this time. Please try again later. Cheers!')
    })
};

drafted.init = () => {
    drafted.events();
};


$(document).ready(function(){ 
     drafted.init();
});