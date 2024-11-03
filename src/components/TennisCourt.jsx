import React, { forwardRef } from 'react';
import { Box } from '@mui/material'; // Import Box from Material-UI

const TennisCourt = forwardRef(({ surface = 'hard', ...props }, ref) => {
  const colors = {
    hard: '#4169E1',
    clay: '#D2691E',
    grass: '#228B22',
    carpet: '#A52A2A', // brown
  };

  return (
    <Box
      ref={ref}
      sx={{
        display: 'inline-block', // Ensures the box wraps the SVG
        border: '5px solid transparent', // Default border
        transition: 'border-color 0.3s ease', // Smooth transition
        '&:hover': {
           scale: 1.1,
        },
      }}
      {...props}
    >
      <svg
        viewBox="0 0 60 80" // Adjusted height to accommodate the court
        width={60}
        height={80}
        style={{ backgroundColor: colors[surface] }}
      >
        <g stroke="white" strokeWidth="1" fill="none">
          {/* Outer court */}
          <rect x="0" y="0" width="60" height="80" />

          {/* Singles sidelines */}
          <line x1="10" y1="0" x2="10" y2="80" /> {/* Left singles sideline */}
          <line x1="50" y1="0" x2="50" y2="80" /> {/* Right singles sideline */}

          {/* Net */}
          <line x1="0" y1="40" x2="60" y2="40" /> {/* Net line */}

          {/* Center service line */}
          <line x1="30" y1="80" x2="30" y2="60" /> {/* Center service line */}

          {/* Service boxes */}
          <rect x="10" y="20" width="20" height="20" fill="none" stroke="white" /> {/* Left service box */}
          <rect x="30" y="20" width="20" height="20" fill="none" stroke="white" /> {/* Right service box */}

          <rect x="10" y="40" width="20" height="20" fill="none" stroke="white" /> {/* Left service box */}
          <rect x="30" y="40" width="20" height="20" fill="none" stroke="white" /> {/* Right service box */}
        </g>
      </svg>
    </Box>
  );
});

TennisCourt.displayName = 'TennisCourt';

export default TennisCourt;
