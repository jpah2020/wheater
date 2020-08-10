//Array of city's that have been searched for
var library = [];
// If there is an item in the library key inside of the lokal storage retrieve it and append it to the form in the shape of a button
if (localStorage.getItem('library')) {
	library = JSON.parse(localStorage.getItem('library'));
	for (var i = 0; i < library.length; i++) {
		var newbutton = $('<button>');
		newbutton.attr('class', 'col-md-12 previousSearch');
		newbutton.text(library[i]);
		$('#searchForm').append(newbutton);
	}
}
//The weather container is mantained hidden untill one of the clicks is excecuted on any of the buttons
$('#theWeather').hide();
//This is the click for my search button
$('#searchButton').click(function (event) {
	event.preventDefault();
	//Show the weather container
	$('#theWeather').show();
	//The city that the user will like to search for, run the function with the value of this input inside of it
	var city = $('input').val();
	ajaxFunction(city);
	//If this item does not already exsist in local add it to local storage and convert its characteristics to lower case
	if (!library.includes(city.toLowerCase())) {
		library.push(city.toLowerCase());
		localStorage.setItem('library', JSON.stringify(library));
		var previousSearch = $('<button>');
		previousSearch.attr('class', 'col-12 previousSearch');
		previousSearch.text(city.toLowerCase());
		$('#searchForm').append(previousSearch);
	}
});
//Shows the previous search when you click on the button with the name of the previous change
$('.previousSearch').click(function (event) {
	event.preventDefault();
	$('#theWeather').show();
	ajaxFunction(event.target.textContent);
});

//This is the function where i retrieve all of the iformation from the open weather api, with the ajax method
function ajaxFunction(cityInput) {
	var queryURL =
		'https://api.openweathermap.org/data/2.5/weather?q=' +
		cityInput +
		'&appid=e5f561d692ee5b0d5bfef99cb764f31d';

	$.get(queryURL).then(function (response) {
		//Every time i run the function clear the main container to prevent the information to append to itself
		$('mainContainer').empty();

		var cityDate = response.name;
		$('#cityDate').text(
			'City: ' + cityDate + ' ' + '(' + moment().format('MMMM Do YYYY') + ')'
		);

		var weatherIcon = $('#iconMain');
		weatherIcon.attr(
			'src',
			'https://openweathermap.org/img/w/' + response.weather[0].icon + '.png'
		);
		weatherIcon.attr('alt', 'The weather icon');

		var temperature = response.main.temp;
		temperature = (temperature - 273.15) * 1.8 + 32;
		temperature = Math.round(temperature);
		temperature = JSON.stringify(temperature);
		$('#temperature').text('Temperature: ' + temperature + ' °F');

		var humidity = JSON.stringify(response.main.humidity);
		$('#humidity').text('Humidity: ' + humidity + '%');

		var wind = JSON.stringify(response.wind.speed);
		$('#wind').text('Wind Speed: ' + wind + 'mph');
		//These are the variables i need to find the UV index
		var latitud = response.coord.lat;
		var longitud = response.coord.lon;
		//The url for the UV index
		var uv =
			'https://api.openweathermap.org/data/2.5/uvi?appid=e5f561d692ee5b0d5bfef99cb764f31d&lat=' +
			latitud +
			'&lon=' +
			longitud;
		//The ajax method that i use to retrieve the uv index
		$.get(uv).then(function (uvIndex) {
			$('#uv').text('UV: ' + uvIndex.value);
		});

		//The api url for the full week forecast
		var theWeekHandler =
			'https://api.openweathermap.org/data/2.5/forecast?q=' +
			response.name +
			'&appid=e5f561d692ee5b0d5bfef99cb764f31d';
		//The ajax method where i retrieve all of the information from the api
		$.get(theWeekHandler).then(function (week) {
			console.log(week);
			//Empty the week container for the information not to append to itself
			$('.week').empty();

			//I use this variable to keep track of the day's I am displaying
			var nextday = 0;

			function myWeeks(weekIndex, elementTarget) {
				var weekForecast = week.list[weekIndex];
				//Add one everytime the function runs
				nextday++;

				var weekForecastTemperature = weekForecast.main.temp;
				weekForecastTemperature = Math.floor(
					Math.round((weekForecastTemperature - 273.15) * 1.8 + 32)
				);

				var weekForecastheader = $('<h1>');
				weekForecastheader.text(
					moment().add(nextday, 'days').format('M/D/YY') +
						' Temp: ' +
						weekForecastTemperature +
						' °F'
				);
				$(elementTarget).append(weekForecastheader);

				var forecastIcon = $('<img>');
				forecastIcon.attr(
					'src',
					'https://openweathermap.org/img/w/' +
						week.list[weekIndex].weather[0].icon +
						'.png'
				);
				forecastIcon.attr('alt', 'The weather icon');
				$(elementTarget).append(forecastIcon);

				var weekForecastHumidity = weekForecast.main.humidity;

				var weekForecastHumidityEl = $('<h1>');
				weekForecastHumidityEl.text('Humidity: ' + weekForecastHumidity + '%');
				$(elementTarget).append(weekForecastHumidityEl);
			}
			//Run the functions for the indivudual weeks and get the information from the number of the array provided
			myWeeks(0, '.week1');
			myWeeks(8, '.week2');
			myWeeks(16, '.week3');
			myWeeks(24, '.week4');
			myWeeks(32, '.week5');
		});
	});
}
