import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CardHeader,
  Slider,
  TextField,
  Box,
  Typography,
  Link,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import CourtSquareWithLines from './CourtSquare';
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

  const getCourtPrice = (club, courtId) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const startTime = new Date(year, month - 1, day, timeRange[0], 0, 0);
    const endTime = new Date(year, month - 1, day, timeRange[1], 0, 0);

    return club.getPrice(courtId, startTime, endTime);
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
        <Typography variant="h5" gutterBottom>
          Tennis Court Price Comparison
        </Typography>

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
              sx={{ display: 'block', mb: 2 }}
            >
              {club.address}
            </Link>} />

          <CardContent>

            {club.courtGroups.map((courtGroup, groupIndex) => (
              <Box key={groupIndex} sx={{ mb: 3, display: 'flex' }} >
                <Box sx={{ flex: 1 }} id="group-info">
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {courtGroup.type} - {courtGroup.surface}
                  </Typography>

                  <Typography variant="subtitle1" >
                    Price: {courtGroup.getPrice(getDates().startTime, getDates().endTime)} PLN
                  </Typography>
                  <Typography variant="body1">
                    Price Range Week Day: {courtGroup.getMaxMinPriceForWeekday().minPrice - courtGroup.getMaxMinPriceForWeekday().maxPrice} PLN
                  </Typography>
                  <Typography variant="body1">
                    Price Range For Weekend: {courtGroup.getMaxMinPriceForWeekend().minPrice - courtGroup.getMaxMinPriceForWeekend().maxPrice} PLN
                  </Typography>
                </Box>

                <Box sx={{
                   display: 'grid',
                    gap: 1,
                  gridTemplateColumns: 'repeat(2, 1fr)'                  
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
                        <TennisCourt surface={court.surface}>
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

export default ClubViewer;