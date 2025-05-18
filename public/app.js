// 1. Fetch and render projects table
fetch('/api/projects')
  .then(r => r.json())
  .then(projects => {
    const tbody = document.querySelector('#projects-table tbody');
    projects.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.project_id}</td>
        <td>${p.project_name}</td>
        <td>${new Date(p.start_date).toLocaleDateString()}</td>
        <td>${new Date(p.end_date).toLocaleDateString()}</td>
        <td>£${p.budget.toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });
    return projects[0];
  })
  // 2. Initialise map on first project
  .then(first => {
    const map = L.map('map').setView(
      [first.latitude, first.longitude], 13
    );
    L.tileLayer(
      `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.MAP_API_KEY}`,
      { id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1 }
    ).addTo(map);
    L.marker([first.latitude, first.longitude]).addTo(map);
    return first;
  })
  // 3. Fetch live weather & AQI
  .then(p => fetch(`/api/weather?lat=${p.latitude}&lon=${p.longitude}`))
  .then(r => r.json())
  .then(data => {
    document.getElementById('weather-info').textContent =
      `Temp: ${data.weather.main.temp}K\n` +
      `Wind: ${data.weather.wind.speed} m/s\n` +
      `AQI: ${data.air.list[0].main.aqi}`;
    return data;
  })
  // 4. Fetch 8-day forecast
  .then(() => {
    const p = projects[0];
    return fetch(`/api/forecast?lat=${p.latitude}&lon=${p.longitude}`);
  })
  .then(r => r.json())
  .then(forecast => {
    document.getElementById('forecast-info').textContent =
      forecast.map((d, i) =>
        `Day ${i+1}: ${d.temp.day}K, ${d.weather[0].description}`
      ).join('\n');
  })
  .catch(err => {
    console.error(err);
    document.getElementById('weather-info').textContent = 'Error loading data';
    document.getElementById('forecast-info').textContent = 'Error loading data';
  });
