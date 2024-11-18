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
  Paper,
} from '@mui/material';
import TennisCourt from './TennisCourt';
import { getCourtColor } from '../lib/consts';
import { formatDistanceStrict, format } from 'date-fns';
import { Label } from '@mui/icons-material';


const marks = Array.from({ length: 49 }, (_, i) => {
  const hour = Math.floor(i / 2);
  return {
    value: i,
    label: i % 4 === 0 ? `${hour.toString().padStart(1, '0')}:00` : ''
  };
});

const ClubViewer = ({ pricingSystem, isMobile }) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [timeRange, setTimeRange] = React.useState([18, 22]);

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
            justifyContent: isMobile ? 'center' : 'space-between',
            gap: 1,            
          }}>
            <Typography align={isMobile ? 'center' : 'left'}>
              Start: {format(getDates().startTime, 'p')} | {formatDistanceStrict(getDates().startTime, getDates().endTime)}
            </Typography>
          </Box>

        </Box>

      </Box>

      {clubs.map((club) => (
        <Card key={club.id} sx={{ mb: 1, border: 0 }}>
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