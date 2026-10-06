

(async () => {
  try {
    const geoRes = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=Morigaon&limit=1', {
      headers: { 'User-Agent': 'NavOkHeal-Test/1.0' }
    });
    const geoData = await geoRes.json();
    console.log('Nominatim:', JSON.stringify(geoData, null, 2));
    
    if (geoData.length > 0) {
      const lat = geoData[0].lat;
      const lon = geoData[0].lon;
      
      const query = `[out:json][timeout:25];nwr["amenity"="pharmacy"](around:20000,${lat},${lon});out center;`;
      console.log('Overpass Query:', query);
      
      const opRes = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      const text = await opRes.text();
      if (text.trim().startsWith('<')) {
        console.error("Overpass returned HTML (rate limited or error):", text.slice(0, 100));
        return;
      }
      const opData = JSON.parse(text);
      
      console.log('Overpass Elements Count:', opData.elements ? opData.elements.length : 'No elements array');
      if (opData.elements && opData.elements.length > 0) {
        console.log('Sample Element:', JSON.stringify(opData.elements[0], null, 2));
      }
    }
  } catch (e) {
    console.error('Error:', e);
  }
})();
