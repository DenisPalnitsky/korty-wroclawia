import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  Slider,
  TextField,
  Box,
  Typography,
  Link, CardContent, Switch, FormControlLabel,
  Grid2, ButtonGroup, Button
} from '@mui/material';
import { formatDistanceStrict, intervalToDuration, formatDuration } from 'date-fns';
import CourtGroupRow from './CourtGroupRow';
import CourtPricingSystem from '../CourtPricingSystem';
import { useTranslation } from 'react-i18next';
import OrderBySelector from './OrderBySelector';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import MapTab from './MapTab';
import ListIcon from '@mui/icons-material/List';
import MapIcon from '@mui/icons-material/Map';

const marks = Array.from({ length: 49 }, (_, i) => {
  const hour = Math.floor(i / 2);
  return {
    value: i,
    label: i % 4 === 0 ? `${hour.toString().padStart(1, '0')}:00` : ''
  };
});

function orderByPrice(clubs, startTime, endTime) {
  return clubs.sort((a, b) => {
    const minPrice = (club, startTime, endTime) => {
      let ma = Number.MAX_SAFE_INTEGER;
      //console.log(`Getting price for ${club.name}. Courts ${club.courtGroups.length}`);
      club.courtGroups.forEach(c => {
        if (!c.isClosed(startTime)){       
          const p = c.getPrice(startTime, endTime);
          //console.log(`Prices for ${c.type} ${c.surface} is ${p}`);
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

const ClubViewer = ({ pricingSystem, isMobile }) => {
  const { t, i18n } = useTranslation();  
  const [view, setView] = useState('list');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = React.useState(tomorrow);
  const [timeRange, setTimeRange] = React.useState([18, 22]);
  const [showClosedCourts, setShowClosedCourts] = React.useState(false);
  const [clubs, setClubs] = React.useState(orderByName(pricingSystem.list()));
  const [order, setOrder] = React.useState('club');
  
  const setOrderedClubs = (ord, startTime, endTime) => {    
    if (ord === 'price') {
      setClubs(orderByPrice (pricingSystem.list(), startTime, endTime));
    }else {
      setClubs(orderByName(pricingSystem.list()));   
    }
  }

  const getDates = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth()+1; // Note: month is 0-based
    const day = selectedDate.getDate();
    
    var startTime = new Date(year, month - 1, day, timeRange[0] / 2, (timeRange[0] % 2) * 30, 0);
    var endTime = new Date(year, month - 1, day, timeRange[1] / 2, (timeRange[1] % 2) * 30, 0);
    if (startTime > endTime) {
      const t = startTime;
      startTime = endTime;
      endTime = t;
    }

    return { startTime, endTime };
  };

  const formatTimeForSlider = (value) => {
    const hours = Math.floor(value / 2);
    const minutes = value % 2 ? '30' : '00';
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleOrderChange = (newOrder) => {      
    setOrder(newOrder);      
    setOrderedClubs(newOrder, getDates().startTime, getDates().endTime);
  };  

  return (
    <Box sx={{ p: isMobile ? 0 : 3 }}>
      <Box id="date-slider-box" sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 4,
        alignItems: 'center',
        mb: 3
      }}>

        
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={i18n.getDateFnsLocale()} >
          <DatePicker
              label={t('Select Date')}
              value={new Date(selectedDate)}
              onChange={(newValue) => {
                setSelectedDate(newValue);
                setOrderedClubs(order, getDates().startTime, getDates().endTime);
              }}
              textField={(params) => <TextField {...params} sx={{ minWidth: '160px' }} />}
            />        
        </LocalizationProvider>

        <Box id="slider-box" sx={{ display: 'flex', width: "100%", gap: 2, flexDirection: isMobile ? 'column' : 'row', }}>
          <Slider
            value={timeRange}
            onChange={(_, newValue) => { setTimeRange(newValue); setOrderedClubs(order, getDates().startTime, getDates().endTime); }}
            valueLabelDisplay="auto"
            marks={marks}
            min={0}
            max={48}
            step={1}
            valueLabelFormat={formatTimeForSlider}
            sx={{ width: isMobile ? '100%' : '75%' }} />


          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            ml: isMobile ? 0 : 2,            
            width: isMobile ? '100%' : '20%',        
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,  
          }}>

              <Typography  variant='body2' sx={{ p: 0.5,  }} align='center' >
                {t('Start') + ' ' + getDates().startTime.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                {isMobile ? ' | ' : <br />}
                {(() => {
                  const endDate = getDates().endTime;
                  const startDate = getDates().startTime;                  
                  const minutes = (endDate - startDate)/ 1000 / 60;


                  if (minutes%60 === 0) {
                    return formatDistanceStrict(startDate, endDate, { locale: i18n.getDateFnsLocale() }) 
                  }else{
                    const duration = intervalToDuration({ start: startDate, end: endDate });
                    return formatDuration(duration, { locale: i18n.getDateFnsLocale() });
                  }                                    
                })()}
                
              </Typography>
          </Box>
       

        </Box>

      </Box>
            

      <Grid2 id="list-controls" container sx={{ mb: isMobile? 1: 2 }}>
  
        <OrderBySelector onOrderChange={handleOrderChange} />


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
                  <Link
                    href={club.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.8em',
                      fontWeight: 400,
                      marginLeft: isMobile ? 0 : 'auto'
                    }}
                  >
                    {club.address}
                  </Link>
                </Box>
              }
            />
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
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


    </Box>
  );
};

ClubViewer.propTypes = {
pricingSystem:PropTypes.instanceOf(CourtPricingSystem).isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default ClubViewer;
