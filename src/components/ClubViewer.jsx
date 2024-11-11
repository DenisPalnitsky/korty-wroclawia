// components/ClubViewer.js
import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  Slider,
  TextField,
  Box,
  Typography,
  Link,
  Tooltip,
  CardContent,
  Grid,
} from '@mui/material';
import TennisCourt from './TennisCourt';
import { getCourtColor } from '../lib/consts';

const marks = [
  { value: 0, label: '00:00' },
  { value: 6, label: '06:00' },
  { value: 12, label: '12:00' },
  { value: 18, label: '18:00' },
  { value: 24, label: '24:00' },
];

const ClubViewer = ({ pricingSystem, isMobile }) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [timeRange, setTimeRange] = React.useState([8, 10]);

  const clubs = pricingSystem.list();

  const formatTime = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getDates = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    var startTime = new Date(year, month - 1, day, timeRange[0], 0, 0);
    var endTime = new Date(year, month - 1, day, timeRange[1], 0, 0);
    if (startTime > endTime) {
      const t = startTime;
      startTime = endTime;
      endTime = t;
    }

    return { startTime, endTime };
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 4, 
          alignItems: 'center',
          mb: 3
        }}>
          <TextField
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ width: isMobile ? '100%' : 'auto' }}
          />

          <Box sx={{ width: isMobile ? '100%' : 600 }}>
            <Typography gutterBottom>Time Range</Typography>
            <Slider
              value={timeRange}
              onChange={(_, newValue) => setTimeRange(newValue)}
              valueLabelDisplay="auto"
              marks={marks}
              min={0}
              max={24}
              valueLabelFormat={formatTime}
            />
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 1 : 0
            }}>
              <Typography>Start: {formatTime(timeRange[0])}</Typography>
              <Typography>End: {formatTime(timeRange[1])}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {clubs.map((club) => (
        <Card key={club.id} sx={{ mb: 3, border: 0 }}>
          <CardHeader 
            title={club.name}
            subheader={
              <Link
                href={club.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'block', mb: 1 }}
              >
                {club.address}
              </Link>
            } 
          />

          <CardContent sx={{ p: isMobile ? 1 : 2 }}>
            {club.courtGroups.map((courtGroup, groupIndex) => (
              <Grid container spacing={2} id="court-group-box" key={groupIndex} 
                sx={{                     
                  border: 3,
                  padding: 1,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'flex-start',                    
                  borderRadius: 1,
                  borderColor: getCourtColor(courtGroup.surface),            
                  borderLeft: `5px solid ${getCourtColor(courtGroup.surface)}`,
                  borderRight: 'none',
                  borderTop: 'none',
                  borderBottom: 'none',
                }}>
                <Grid item xs={isMobile ? 12 : 3} id="group-info">
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Court type: {courtGroup.type} 
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Surface: {courtGroup.surface}
                  </Typography>               
                </Grid>
                  
                <Grid item xs={isMobile ? 12 : 2} sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <Typography 
                    variant="subtitle1"
                    sx={{
                      borderRadius: 1,
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: isMobile ? '100%' : '120px',  // Adjust width for mobile
                      padding: isMobile ? '8px' : '8px 16px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '40px', // Fixed height
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    Price: {courtGroup.getPrice(getDates().startTime, getDates().endTime)} PLN
                  </Typography>
                </Grid>

                <Grid item xs={isMobile ? 12 : 'grow'}>
                  <Typography variant="body1">
                    Price Range Week Day: {courtGroup.getMaxMinPriceForWeekday()?.minPrice - courtGroup.getMaxMinPriceForWeekday()?.maxPrice} PLN
                  </Typography>
                  <Typography variant="body1">
                    Price Range For Weekend: {courtGroup.getMaxMinPriceForWeekend()?.minPrice - courtGroup.getMaxMinPriceForWeekend()?.maxPrice} PLN
                  </Typography>
                </Grid>
            
                <Grid container item xs={isMobile ? 12 : 'auto'} spacing={1} 
                  sx={{
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: 1,
                    marginLeft: 'auto', 
                    marginRight: isMobile ? 0 : 1,
                    padding: 1,                           
                    width: 'auto', 
                    justifyContent: 'flex-end', 
                    alignItems: 'center'                           
                  }} 
                  id="court-tiles">
                  {courtGroup.courts.map((court) => {
                    const price = courtGroup.getPrice(getDates().startTime, getDates().endTime);
                    return (
                      <Tooltip
                        key={court.id}
                        title={
                          price
                            ? `Court ${court.id}: ${price} PLN`
                            : 'Price not available'
                        }
                      > 
                        <TennisCourt surface={court.surface} courtName={court.id}>
                          {court.id}
                        </TennisCourt>
                      </Tooltip>
                    );
                  })}
                </Grid>
              </Grid>
            ))}

          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

ClubViewer.propTypes = {
  pricingSystem: PropTypes.shape({
    list: PropTypes.func.isRequired,
  }).isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default ClubViewer;