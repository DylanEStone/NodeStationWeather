getData("Goldstone");
getData("Canberra");
getData("Madrid");

setInterval(() => getData("Goldstone"), 300000);
setInterval(() => getData("Canberra"), 300000);
setInterval(() => getData("Madrid"), 300000);

async function getData(station) {
  const response = await fetch('/api/' + station);
  console.log(response);
  const data = await response.json();
  console.log(data[0].txt_status)
  document.getElementById(station).innerHTML = (data[0].txt_status);
  document.getElementById(station + "Wind").innerHTML=("Wind Speed: " + data[0].wind_speed);
  document.getElementById(station + "Cloud").innerHTML=("Cloud Coverage: " + data[0].cloud_coverage);
  document.getElementById(station + "Icon").setAttribute('src', 'http://openweathermap.org/img/wn/' + data[0].icon + '@2x.png');
}