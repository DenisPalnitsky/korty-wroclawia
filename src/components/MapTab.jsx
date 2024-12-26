import {APIProvider, Map} from '@vis.gl/react-google-maps';


const MapTab = () => {
  return (
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          style={{ width: '100%', height: 'calc(100vh - 64px)'}}
          defaultCenter={{ lat: 51.1093, lng: 17.0386 }}
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={true}                
        />
    </APIProvider>
  );
};

export default MapTab;
