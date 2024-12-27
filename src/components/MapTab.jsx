import {APIProvider, Map, InfoWindow, Marker} from '@vis.gl/react-google-maps';
import {MapMarker} from './MapMarker';
import PropTypes from 'prop-types';
import { Club } from '../CourtPricingSystem';

const MapTab = ({ clubs, startTime, endTime }) => {
  return (
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          style={{ width: '100%', height: 'calc(100vh - 64px)'}}
          defaultCenter={{ lat: 51.1093, lng: 17.0386 }}
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={true}         
          mapId={'ad241cfac5cdf6e3'}       
        >
          {clubs.map((club) => (

            <MapMarker key={club.id} position={{ lat: club.coordinates.lat, lng: club.coordinates.long }} club={club} startTime={startTime } endTime={ endTime}/>
           
            // <InfoWindow position={{ lat: club.coordinates.lat, lng: club.coordinates.long }}  key={club.id} 
            //       headerContent={<h4>{club.name}</h4>}>
            //     <div>
            //         {club.courtGroups.map((courtGroup, index) => (
            //           !courtGroup.isClosed(startTime) && (
            //             <span key={index}>
            //               {courtGroup.surface}/{courtGroup.type}: {courtGroup.getPrice(startTime, endTime)} zł
            //             </span>
            //           )
            //         ))}
            //     </div>
            //   </InfoWindow>
            // <Marker key={club.id} position={{ lat: club.coordinates.lat, lng: club.coordinates.long }}>
              
            // </Marker>
          ))}
        </Map>
    </APIProvider>
  );
};

MapTab.propTypes = {
  clubs: PropTypes.arrayOf(PropTypes.instanceOf(Club)).isRequired,
  startTime: PropTypes.instanceOf(Date).isRequired,
  endTime: PropTypes.instanceOf(Date).isRequired,
};

export default MapTab;
