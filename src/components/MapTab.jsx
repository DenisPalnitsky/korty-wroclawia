import React, { useEffect, useRef } from 'react';
import courtsData from '../assets/courts.yaml';

const MapTab = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    googleMapsScript.onload = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 51.107883, lng: 17.038538 },
        zoom: 12,
      });

      courtsData.forEach((court) => {
        const marker = new window.google.maps.Marker({
          position: { lat: parseFloat(court.latitude), lng: parseFloat(court.longitude) },
          map,
          title: court.name,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div>
              <h3>${court.name}</h3>
              <p>${court.address}</p>
              <p>${court.prices.map(price => `${price.from} - ${price.to}: ${price.schedule}`).join('<br>')}</p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
    };

    document.body.appendChild(googleMapsScript);

    return () => {
      document.body.removeChild(googleMapsScript);
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
};

export default MapTab;
