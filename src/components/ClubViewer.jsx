import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,

  TextField,
  Box,
  Typography,
  Link, CardContent, Switch, FormControlLabel,
  Grid2, ButtonGroup, Button, MenuItem, Alert, Snackbar, CircularProgress
} from '@mui/material';
import CourtGroupRow from './CourtGroupRow';
import CourtPricingSystem from '../CourtPricingSystem';
import { useTranslation } from 'react-i18next';
import OrderBySelector from './OrderBySelector';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import MapTab from './MapTab';
import ListIcon from '@mui/icons-material/List';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentLocation, sortClubsByDistance, formatDistance, calculateDistance } from '../lib/locationUtils';


function orderByPrice(clubs, startTime, endTime) {
  return clubs.sort((a, b) => {
    const minPrice = (club, startTime, endTime) => {
      let ma = Number.MAX_SAFE_INTEGER;
      club.courtGroups.forEach(c => {
        if (!c.isClosed(startTime)) {
          const p = c.getPrice(startTime, endTime);
          if (p < ma) {
            ma = p;
          }
        }
      });
      return ma;
    }

    const aPrices = minPrice(a, startTime, endTime);
    const bPrices = minPrice(b, startTime, endTime);

    return aPrices - bPrices;
  });
}

function orderByName(clubs) {
  return clubs.sort((a, b) => a.name.localeCompare(b.name));
}

function orderByDistance(clubs, userLat, userLong) {
  return sortClubsByDistance(clubs, userLat, userLong);
}

function genDurations(isMobile) {
  const result = [];
  const end = isMobile ? 8 : 48;

  for (let i = 1; i <= end; i++) {
    result.push({ display: i % 2 !== 0 ? (i - 1) / 2 + ":30" : i / 2 + ":00", value: i / 2 });
  }


  return result;
}

const ClubViewer = ({ pricingSystem, isMobile }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const view = location.pathname === '/map' ? 'map' : 'list';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = React.useState(tomorrow);
  const [startHour, setStartHour] = useState(9);
  const [duration, setDuration] = useState(2);
  const [showClosedCourts, setShowClosedCourts] = React.useState(false);
  const [order, setOrder] = React.useState('price');
  const [userLocation, setUserLocation] = React.useState(null);
  const [locationLoading, setLocationLoading] = React.useState(false);
  const [locationError, setLocationError] = React.useState(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const getDates = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1; // Note: month is 0-based
    const day = selectedDate.getDate();

    const mobileHr = Math.floor(startHour);
    const mobileMin = (startHour - mobileHr) * 60;
    const startTime = new Date(year, month - 1, day, mobileHr, mobileMin, 0);
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);


    return { startTime, endTime };
  };

  const { startTime, endTime } = getDates();
  const [clubs, setClubs] = React.useState(orderByPrice(pricingSystem.list(), startTime, endTime));

  const addDistancesToClubs = (clubs) => {
    if (!userLocation) return clubs;

    return clubs.map(club => ({
      ...club,
      distance: club.coordinates?.lat && club.coordinates?.long
        ? calculateDistance(
            userLocation.lat,
            userLocation.long,
            club.coordinates.lat,
            club.coordinates.long
          )
        : undefined
    }));
  };

  const setOrderedClubs = (ord, startTime, endTime) => {
    let sortedClubs;

    if (ord === 'price') {
      sortedClubs = orderByPrice(pricingSystem.list(), startTime, endTime);
      sortedClubs = addDistancesToClubs(sortedClubs);
    } else if (ord === 'distance') {
      if (userLocation) {
        sortedClubs = orderByDistance(pricingSystem.list(), userLocation.lat, userLocation.long);
      } else {
        sortedClubs = orderByName(pricingSystem.list());
      }
    } else {
      sortedClubs = orderByName(pricingSystem.list());
      sortedClubs = addDistancesToClubs(sortedClubs);
    }

    setClubs(sortedClubs);
  }

  const handleOrderChange = (newOrder) => {
    setOrder(newOrder);
    if (newOrder === 'distance' && !userLocation) {
      handleGetLocation();
    } else {
      setOrderedClubs(newOrder, getDates().startTime, getDates().endTime);
    }
  };

  const handleGetLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Sort by distance with distances calculated
      const sortedWithDistances = orderByDistance(pricingSystem.list(), location.lat, location.long);
      setClubs(sortedWithDistances);
    } catch (error) {
      setLocationError(error.message);
      setSnackbarOpen(true);
      setOrder('club');
      setOrderedClubs('club', getDates().startTime, getDates().endTime);
    } finally {
      setLocationLoading(false);
    }
  };

  const setView = (newView) => {
    navigate(newView === 'map' ? '/map' : '/list');
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box id="club-viewer-box" sx={{ p: isMobile ? 0 : 3, alignItems: 'center' }}>


      <Grid2 id="date-slider-box" container
        spacing={isMobile? 1 : 3}

        sx={{
          mb: 2,
        }}>

        <Grid2 size={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={i18n.getDateFnsLocale()} >
            <DatePicker
              label={t('Select Date')}
              value={new Date(selectedDate)}
              onChange={(newValue) => {
                setSelectedDate(newValue);
                setOrderedClubs(order, getDates().startTime, getDates().endTime);
              }}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </Grid2>

        <Grid2 size={4}>
          <TextField
            id='start-time-combo-box'
            select
            label={isMobile ? t('start_hour_mobile') : t('start_hour')}
            value={startHour}
            sx = {{width: '100%'}}
            onChange={(e) => {
              setStartHour(parseFloat(e.target.value));
              setOrderedClubs(order, getDates().startTime, getDates().endTime);
            }}
          >
            {Array.from({ length: 48 }, (_, i) => {
              const val = i * 0.5; // 0, 0.5, 1, 1.5, ...
              const hr = Math.floor(val);
              const min = (val - hr) * 60;
              const label = `${hr.toString().padStart(2, '0')}:${min === 0 ? '00' : '30'}`;
              return (
                <MenuItem key={val} value={val}>
                  {label}
                </MenuItem>
              );
            })}
          </TextField>
        </Grid2>

        <Grid2 size="grow">
          <TextField
            id="duration-combo-box"
            select
            label={isMobile ? t('duration_mobile') : t('Duration')}
            value={duration}
            sx = {{width: '100%'}}
            onChange={(e) => {
              setDuration(parseFloat(e.target.value));
              setOrderedClubs(order, getDates().startTime, getDates().endTime);
            }}
          >
            {genDurations(isMobile).map(v => (
              <MenuItem key={v.display} value={v.value}>
                {v.display}
              </MenuItem>
            ))}
          </TextField>
        </Grid2>

      </Grid2>


      <Grid2 id="list-controls" container sx={{ mb: isMobile ? 1 : 2 }}>

        <OrderBySelector onOrderChange={handleOrderChange} />

        {order === 'distance' && !userLocation && (
          <Button
            onClick={handleGetLocation}
            disabled={locationLoading}
            startIcon={locationLoading ? <CircularProgress size={16} /> : <LocationOnIcon />}
            variant="outlined"
            size="small"
            sx={{ ml: 1 }}
          >
            {locationLoading ? t('Getting location...') : t('Get my location')}
          </Button>
        )}

        {!isMobile && (
          <FormControlLabel
            control={
              <Switch
                checked={showClosedCourts}
                onChange={() => setShowClosedCourts(!showClosedCourts)}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                {t('Show Closed')}
              </Typography>
            }
          />
        )}

        <Box sx={{ flexGrow: 1 }} />

        <ButtonGroup variant="outlined" size="small" aria-label="outlined primary button group">
          <Button
            onClick={() => setView('list')}
            variant={view === 'list' ? 'contained' : 'outlined'}
            startIcon={<ListIcon />}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {!isMobile && t('List')}
          </Button>
          <Button
            onClick={() => setView('map')}
            variant={view === 'map' ? 'contained' : 'outlined'}
            startIcon={<MapIcon />}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {!isMobile && t('Map')}
          </Button>
        </ButtonGroup>

      </Grid2>

      <Box id="cubs-list-container">

        {view === 'list' ? (
          clubs.map((club) => (
            <Card key={club.id} sx={{ mb: 1, border: 0 }}>
              <CardHeader
                title={
                  <Box sx={{
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 0.5 : 2,
                    width: '100%'
                  }}>
                    <Link
                      href={club.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {club.name}
                    </Link>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      marginLeft: isMobile ? 0 : 'auto',
                      gap: 1
                    }}>
                      <Link
                        href={club.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: 'text.secondary',
                          fontSize: (theme) => theme.typography.caption.fontSize,
                          fontWeight: 400,
                        }}
                      >
                        {club.address}
                      </Link>
                      {club.distance !== undefined && (
                        <Typography variant="body2" sx={{
                          color: 'primary.main',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}>
                          <LocationOnIcon sx={{ fontSize: 16 }} />
                          {formatDistance(club.distance)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                }
              />
              <CardContent sx={{ p:0, '&:last-child': { pb: 0 }}}>
                {club.courtGroups.map((courtGroup, groupIndex) => (
                  <CourtGroupRow
                    key={groupIndex}
                    groupIndex={groupIndex}
                    courtGroup={courtGroup}
                    isMobile={isMobile}
                    startTime={getDates().startTime}
                    endTime={getDates().endTime}
                    showClosedCourts={showClosedCourts}
                  />
                ))}
              </CardContent>
            </Card>
          ))
        ) : (
          <MapTab clubs={clubs} startTime={getDates().startTime} endTime={getDates().endTime} />
        )}

      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: '100%' }}
        >
          {locationError}
        </Alert>
      </Snackbar>

    </Box>
  );
};

ClubViewer.propTypes = {
  pricingSystem: PropTypes.instanceOf(CourtPricingSystem).isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default ClubViewer;
