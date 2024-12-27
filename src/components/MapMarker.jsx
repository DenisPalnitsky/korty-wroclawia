import { useState, useCallback } from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { getCourtColor, getCourtColorDark } from '../lib/consts';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Club } from '../CourtPricingSystem';



export const MapMarker = ({ position, club, startTime, endTime }) => {
  const { t } = useTranslation();
  // `markerRef` and `marker` are needed to establish the connection between
  // the marker and infowindow (if you're using the Marker component, you
  // can use the `useMarkerRef` hook instead).
  const [markerRef, marker] = useAdvancedMarkerRef();

  const [infoWindowShown, setInfoWindowShown] = useState(true);

  // clicking the marker will toggle the infowindow
  const handleMarkerClick = useCallback(
    () => setInfoWindowShown(isShown => !isShown),
    []
  );

  // if the maps api closes the infowindow, we have to synchronize our state
  const handleClose = useCallback(() => setInfoWindowShown(false), []);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        onClick={handleMarkerClick}
      />

      {infoWindowShown && (
        <InfoWindow anchor={marker} onClose={handleClose} headerDisabled={true}>
          <div>
            <div><b>{club.name}</b></div>
            {club.courtGroups.map((courtGroup, index) => (
              !courtGroup.isClosed(startTime) && (
                <div
                  key={index}
                  style={{
                    backgroundColor: getCourtColor(courtGroup.surface),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    marginTop: '4px',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: getCourtColorDark(courtGroup.surface),
                    }
                  }}
                >
                  {t(courtGroup.surface)}: {courtGroup.getPrice(startTime, endTime)} zł
                </div>
              )
            ))}
          </div>
        </InfoWindow>
      )}
    </>
  );
};


MapMarker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }).isRequired,
  club: PropTypes.instanceOf(Club).isRequired,
  startTime: PropTypes.instanceOf(Date).isRequired,
  endTime: PropTypes.instanceOf(Date).isRequired
};