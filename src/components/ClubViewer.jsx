import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  Slider,
  TextField,
  Box,
  Typography,
  Link, CardContent, Switch, FormControlLabel
} from '@mui/material';
import { formatDistanceStrict, intervalToDuration,formatDuration} from 'date-fns';
import { pl } from 'date-fns/locale';
import CourtGroupRow from './CourtGroupRow';
import CourtPricingSystem from '../CourtPricingSystem';
import { useTranslation } from 'react-i18next';

const marks = Array.from({ length: 49 }, (_, i) => {
  const hour = Math.floor(i / 2);
  return {
    value: i,
    label: i % 4 === 0 ? `${hour.toString().padStart(1, '0')}:00` : ''
  };
});

const ClubViewer = ({ pricingSystem, isMobile }) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [timeRange, setTimeRange] = React.useState([18, 22]);
  const [showClosedCourts, setShowClosedCourts] = React.useState(false);

  const clubs = pricingSystem.list();

  const getDates = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
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

  return (
    <Box sx={{ p: isMobile ? 0 : 3 }}>
      <Box id="date-slider-box" sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 4,
        alignItems: 'center',
        mb: 3
      }}>

        <TextField
          type="date"
          label={t('Select Date')}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ minWidth: '160px' }}
        />


        <Box id="slider-box" sx={{ display: 'flex', width: "100%", gap: 2, flexDirection: isMobile ? 'column' : 'row', }}>
          <Slider
            value={timeRange}
            onChange={(_, newValue) => { setTimeRange(newValue); }}
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
                {t('Start') + ' ' + getDates().startTime.toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })}
                {isMobile ? ' | ' : <br />}
                {(() => {
                  const endDate = getDates().endTime;
                  const startDate = getDates().startTime;                  
                  const minutes = (endDate - startDate)/ 1000 / 60;


                  if (minutes%60 === 0) {
                    return formatDistanceStrict(startDate, endDate, { locale: pl }) 
                  }else{
                    const duration = intervalToDuration({ start: startDate, end: endDate });
                    return formatDuration(duration, { locale: pl });
                  }                                    
                })()}
                
              </Typography>
          </Box>
       

        </Box>

      </Box>
      <Box>
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
                {t('Show Closed Courts')}
              </Typography>
            }
          />
      </Box>

      {clubs.map((club) => (
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
      ))}
    </Box>
  );
};

ClubViewer.propTypes = {
pricingSystem:PropTypes.instanceOf(CourtPricingSystem).isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default ClubViewer;
