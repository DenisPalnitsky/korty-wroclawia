import  { useState } from 'react';
import PropTypes from 'prop-types';
import {  
  CardHeader,
  Slider,
  TextField,
  Box,
  Typography,
  Link,
  Tooltip,
  Card,
  CardContent,
  Grid2
} from '@mui/material';
import TennisCourt from './TennisCourt';


const marks = [
  { value: 0, label: '00:00' },
  { value: 6, label: '06:00' },
  { value: 12, label: '12:00' },
  { value: 18, label: '18:00' },
  { value: 24, label: '24:00' },
];

const ClubViewer = ({ pricingSystem }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeRange, setTimeRange] = useState([8, 10]);
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
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>

        <Box sx={{ display: 'flex', gap: 4, mb: 3, alignItems: 'center' }}>
          <TextField
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Box sx={{ width: 600 }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Start: {formatTime(timeRange[0])}</Typography>
              <Typography>End: {formatTime(timeRange[1])}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {clubs.map((club) => (
        <Card key={club.id} sx={{ mb: 3 }}>
          <CardHeader title={club.name}
            subheader={<Link
              href={club.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'block', mb: 1 }}
            >
              {club.address}
            </Link>} />

          <CardContent
            sx={{ p: { xs: 1, sm: 2 }}}
          >

            {club.courtGroups.map((courtGroup, groupIndex) => (
              <Box id='court-group-box' key={groupIndex} 
                  sx={{                     
                    border: 1,
                    padding: 1,
                    display: 'flex',
                    alignItems: 'flex-start',
                    width: '100%'                    
                    }} >
                <Box sx={{ flex: 1 }} id="group-info">
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Court type:  {courtGroup.type} 
                    </Typography>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Surface: {courtGroup.surface}
                  </Typography>               
                </Box>

                <Box id="prices" sx={{
                                    display: 'flex',
                                    gap: 2,
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between'
                                  }}>
                   
                  <Typography hidden={ !courtGroup.isClosed(getDates().startTime) } variant="body1" sx={{ mb: 1 }}>
                    Closed
                  </Typography>
                  
                  <Grid2 container hidden={ courtGroup.isClosed(getDates().startTime)}> 
                    <Box sx={{
                      borderRadius: 1,
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}>
                      <Typography variant="subtitle1">
                        Price: {courtGroup.getPrice(getDates().startTime, getDates().endTime)} PLN
                      </Typography>
                    </Box>

                    {/* Price Ranges Column */}
                    <Box>
                      <Typography variant="body1">
                        Price Range Week Day: {courtGroup.getMaxMinPriceForWeekday()?.minPrice - courtGroup.getMaxMinPriceForWeekday()?.maxPrice} PLN
                      </Typography>
                      <Typography variant="body1">
                        Price Range For Weekend: {courtGroup.getMaxMinPriceForWeekend()?.minPrice - courtGroup.getMaxMinPriceForWeekend()?.maxPrice} PLN
                      </Typography>
                    </Box>
                  </Grid2>
                  
                </Box>

                <Box border={1} sx={{
                        display: 'grid',
                        gap: 1, // Increased gap for better spacing
                        gridTemplateColumns: 'repeat(3, 1fr)',  
                        marginLeft: 2, // Add spacing from group-info
                        alignItems: 'right',
                        justifyContent: 'start'              
                }} id="court-tiles" >
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
                        <TennisCourt surface={court.surface} courtNumber={court.id}>
                          {court.id}
                        </TennisCourt>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
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
};

export default ClubViewer;
