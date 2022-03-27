var APIkey = "85ba596a7dffbaacbd7f0be73d53d1db";
var date = moment().format("l");
var savedSearch = [];
var latestSearch = [];
var updateSearch = [];

$('#submit').click(function (event) {
    event.preventDefault();

    var search = $('#searchInput').val().trim();

    if (search === "" || search === null) {
        return;
    }

    $('.todayDiv').removeClass('hidden');
    $('.forecastDiv').removeClass('hidden');
    searchWeather(search);
    saveSearch(search);
    renderHistory();
    search = "";
});

$(".historyList").on("click", ".historyBtn", function () {
    $('.todayDiv').removeClass('hidden');
    $('.forecastDiv').removeClass('hidden');
    searchWeather($(this).text().trim());

});

// call openweathermap APIs to get weather
function searchWeather(search) {
    var weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + search + "&units=imperial&appid=" + APIkey;

    // call weather API to get today's weather
    $.ajax({
        url: weatherURL,
        method: "GET"
    })
        .then(function (weatherResponse) {

            var latitude = weatherResponse.coord.lat;
            var longitude = weatherResponse.coord.lon;
            var uviURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=" + APIkey;
            var forecastURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&exclude=current+minutely+hourly+alerts&units=imperial&appid=" + APIkey;
            var icon = weatherResponse.weather[0].icon;
            var iconURL = "http://openweathermap.org/img/wn/" + icon + ".png";

            // Declare variables to display on the main card            
            $('#todayTitle').html(search);
            $('#todayTitle').css("color", "white");
            $('#mainCardTitle').html("Current Weather " + "(" + date + ")");
            $('#mainIcon').attr("src", iconURL);
            $('#temperature').html("Temperature: " + Math.floor(weatherResponse.main.temp) + "&deg");
            $('#humidity').html("Humidity: " + Math.floor(weatherResponse.main.humidity) + "&deg");
            $('#wind').html("Wind Speed: " + weatherResponse.wind.speed + " mph");


            // Call uvi API to get UV index    
            $.ajax({
                url: uviURL,
                method: "GET",
                success: function (data) {
                    var uviEl = $('#uvIndex').html("UV Index: " + Math.floor(data.value));
                    $('#uvIndex').css("width", "auto");

                    uviEl.css("background-color", "transparent");

                    if (uviEl.val() >= 8) {
                        uviEl.css("background-color", "orange");

                    } else if (uviEl.val() >= 6 && uviEl.val() <= 7) {
                        uviEl.css("background-color", "black");

                    } else if (uviEl.val() >= 3 && uviEl.val() <= 5) {
                        uviEl.css("background-color", "yellow");

                    } else {
                        uviEl.css("background-color", "blue");

                    }
                    $('#uvi').append(uviEl);
                }
            });

            // Call onecall API get 5-day forecast
            $.ajax({
                url: forecastURL,
                method: "GET",
            })
                .then(function (forecastResponse) {

                    $('#5dayTitle').html("5 Day Forecast");
                    $('#5dayTitle').css("color", "white");

                    for (var i = 0; i < 5; i++) {
                        fDate = moment.unix(forecastResponse.daily[i].dt).format('l');
                        fIcon = forecastResponse.daily[i].weather[0].icon;
                        fTemp = forecastResponse.daily[i].temp.day;
                        fHumid = forecastResponse.daily[i].humidity;

                        var iconURL = "http://openweathermap.org/img/wn/" + fIcon + ".png";

                        $('#dayicon-' + i).attr("src", iconURL);
                        $('#fcDate-' + i).html(fDate);
                        $('#fcTemp-' + [i]).html("Temp: " + Math.floor(fTemp) + "&deg");
                        $('#fcHumid-' + [i]).html("Humid: " + Math.floor(fHumid) + "&deg");

                    }
                });

        });
}

function styleUV(uviEl) {

}

// save the current search parameter to local storage and display a corresponding button
function saveSearch(searchJSON) {

    if (localStorage.getItem("history") == "" || localStorage.getItem("history") == null) {
        // push search to array
        savedSearch.push(searchJSON);
        // stringify and write array to local storage
        localStorage.setItem("history", JSON.stringify(savedSearch));
    } else {
        // assign local storage values to last search
        updateSearch = JSON.parse(localStorage.getItem("history"));
        updateSearch.push(searchJSON);
        localStorage.setItem("history", JSON.stringify(updateSearch));
    }

}
var renderBtn;
// render past searches as buttons on the page
function renderHistory() {
    $('#searchInput').val('');
    latestSearch = JSON.parse(localStorage.getItem("history"));

    if (latestSearch !== null) {
        $('.historyList').empty();
        for (var j = 0; j < latestSearch.length; j++) {
            renderBtn = $('<button>');
            renderBtn.attr({ type: 'button', class: 'btn btn-light historyBtn', id: 'historyBtn-' + j });
            renderBtn.css("margin", "5px");
            renderBtn.html(latestSearch[j]);
            $('.historyList').append(renderBtn);
        }
    }

}

// display buttons for past searches (if they exist)
renderHistory();