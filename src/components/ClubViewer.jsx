import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  TextField,
  Box,
  Typography,
  Link,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const CourtSquare = styled(Box)(({ surface }) => ({
  width: 60,
  height: 60,
  margin: 4,
  border: '1px solid #000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: surface === 'clay' ? '#ff8c69' : '#4169e1',
  color: '#fff',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Tennis Court Booking System
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
          
          <Box sx={{ width: 300 }}>
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
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {club.name}
            </Typography>
            
            <Link 
              href={club.googleMapsLink} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ display: 'block', mb: 2 }}
            >
              {club.address}
            </Link>

            {club.courtGroups.map((courtGroup, groupIndex) => (
              <Box key={groupIndex} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {courtGroup.type} - {courtGroup.surface}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {courtGroup.courts.map((court) => {
                    const price = getCourtPrice(club, court.id);
                    return (
                      <Tooltip
                        key={court.id}
                        title={
                          price 
                            ? `Court ${court.id}: ${price} PLN` 
                            : 'Price not available'
                        }
                      >
                        <CourtSquare surface={court.surface}>
                          {court.id}
                        </CourtSquare>
                      </Tooltip>
                    );
                  })}
                </Box>

                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Court</TableCell>
                        <TableCell>Surface</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Current Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {courtGroup.courts.map((court) => {
                        const currentPrice = getCourtPrice(club, court.id);
                        const priceInfo = court.getMaxMinPrice(new Date(selectedDate));
                        return (
                          <TableRow key={court.id}>
                            <TableCell>{court.id}</TableCell>
                            <TableCell>{court.surface}</TableCell>
                            <TableCell>{court.type}</TableCell>
                            <TableCell align="right">
                              {currentPrice ? `${currentPrice} PLN` : 'N/A'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ClubViewer;