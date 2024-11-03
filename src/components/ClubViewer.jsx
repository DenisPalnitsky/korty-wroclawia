import React, { useState, useEffect } from 'react';
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
  const [courts, setCourts] = useState([]);

  const formatTime = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  useEffect(() => {
    if (pricingSystem) {
      const updatedCourts = pricingSystem.listCourts();
      setCourts(updatedCourts);
    }
  }, [pricingSystem, selectedDate, timeRange]);

 
  const groupCourtsByClub = () => {
    const clubMap = new Map();
    
    courts.forEach(court => {
      if (!clubMap.has(court.clubId)) {
        const club = pricingSystem.clubs.find(c => c.id === court.clubId);
        clubMap.set(court.clubId, {
          ...club,
          courts: []
        });
      }
      clubMap.get(court.clubId).courts.push(court);
    });

    return Array.from(clubMap.values());
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

      {pricingSystem.list().map(club) => (
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

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {club.courts.map((court) => {          
                const price = 20;
                return (
                  <Tooltip
                    key={court.courtId}
                    title={
                      price 
                        ? `Court ${court.courtId}: ${price} PLN` 
                        : 'Price not available'
                    }
                  >
                    <CourtSquare surface={court.surface}>
                      {court.courtId}
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
                    <TableCell align="right">Min Price</TableCell>
                    <TableCell align="right">Max Price</TableCell>
                    <TableCell align="right">Current Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {club.courts.map((court) => (
                    <TableRow key={court.courtId}>
                      <TableCell>{court.courtId}</TableCell>
                      <TableCell>{court.surface}</TableCell>
                      <TableCell>{court.type}</TableCell>
                      <TableCell align="right">{court.minPrice} PLN</TableCell>
                      <TableCell align="right">{court.maxPrice} PLN</TableCell>
                      <TableCell align="right">
                        {court.getPrice()} PLN
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ClubViewer;