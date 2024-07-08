import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';

const containerStyle = {
  width: '80%',
  height: '600px'
};

const center = {
  lat: 31.4672,
  lng: 74.2659
};

const origin = { lat: 31.4672, lng: 74.2659 };
const destination = { lat: 31.4715, lng: 74.3555 };

const MemoizedPolyline = React.memo(Polyline);
const MemoizedMarker = React.memo(Marker);

function Map() {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
  const directionsServiceRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchDirections = () => {
      if (window.google && window.google.maps && !directionsServiceRef.current) {
        directionsServiceRef.current = new window.google.maps.DirectionsService();
        directionsServiceRef.current.route(
          {
            origin: origin,
            destination: destination,
            travelMode: 'WALKING',
            provideRouteAlternatives: true
          },
          (response, status) => {
            if (status === 'OK') {
              setDirectionsResponse(response);
            } else {
              console.error('Error fetching directions:', status);
            }
          }
        );
      }
    };

    fetchDirections();
  }, []);

  useEffect(() => {
    if (directionsResponse) {
      setSelectedRouteIndex(0);
    }
  }, [directionsResponse]);

  const handleRouteClick = (index) => {
    setSelectedRouteIndex(index);
  };

  const getMarkerIcon = (index) => {
    return index === 0 ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' :
           index === directionsResponse.routes.length - 1 ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 
           'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  };

  return (
    <LoadScript
      googleMapsApiKey= {process.env.REACT_APP_GOOGLE_MAP_PLACE_API_KEY}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={(map) => (mapRef.current = map)}
      >
        {directionsResponse &&
          directionsResponse.routes.map((route, index) => {
            const path = route.overview_path.map((point) => ({
              lat: point.lat(),
              lng: point.lng()
            }));
            return (
              <MemoizedPolyline
                key={`polyline-${index}`}
                path={path}
                options={{
                  strokeColor:
                    selectedRouteIndex === index
                      ? '#009DA0'
                        : '#BDBDBD',
                  strokeWeight: 5,
                  strokeOpacity: selectedRouteIndex === index ? 1 : 0.5,
                  zIndex: selectedRouteIndex === index ? 2 : 1
                }}
                onClick={() => handleRouteClick(index)}
              />
            );
          })}

        {directionsResponse && selectedRouteIndex !== null && (
          <>
            <Marker
              position={directionsResponse.routes[selectedRouteIndex].legs[0].start_location}
              icon={{
                url: getMarkerIcon(0),
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
            <Marker
              position={directionsResponse.routes[selectedRouteIndex].legs[0].end_location}
              icon={{
                url: getMarkerIcon(directionsResponse.routes.length - 1),
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
          </>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default Map;
