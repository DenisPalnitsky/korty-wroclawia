import  { forwardRef } from 'react';
import { Box } from '@mui/material'; // Import Box from Material-UI
import PropTypes from 'prop-types';

const TennisCourt = forwardRef(({ surface = 'hard', courtNumber, ...props }, ref) => {
  const colors = {
    hard: '#4169E1',
    clay: '#D2691E',
    grass: '#228B22',
    carpet: '#A52A2A',
  };

  return (
    <Box
      ref={ref}
      sx={{
        display: 'inline-block',
        border: '1px solid transparent',
        transition: 'border-color 0.3s ease',
        '&:hover': {
           scale: 1.1,
        },
      }}
      {...props}
    >
      <svg
        viewBox="0 0 60 80"
        width={60*0.5}
        height={80*0.5}
        style={{ backgroundColor: colors[surface] }}
      >
        <g stroke="white" strokeWidth="2" fill="none" transform="translate(6,8) scale(0.8)">
         

      {/* Outer court
      <rect x="0" y="0" width="100%" height="100%" /> */}

      {/* Singles sidelines */}
      {/* <line x1="16.67%" y1="0" x2="16.67%" y2="100%" /> Left singles sideline */}
      {/* <line x1="83.33%" y1="0" x2="83.33%" y2="100%" /> Right singles sideline */}

      {/* Net */}
      {/* <line x1="0" y1="50%" x2="100%" y2="50%" /> Net line */}


      {/* Service boxes */}
      {/* <rect x="16.67%" y="25%" width="33.33%" height="25%" /> Left top service box */}
      {/* <rect x="50%" y="25%" width="33.33%" height="25%" /> Right top service box */}

      {/* <rect x="16.67%" y="50%" width="33.33%" height="25%" /> Left bottom service box */}
      {/* <rect x="50%" y="50%" width="33.33%" height="25%" /> Right bottom service box */}

      <rect
        x="20%"
        y="20%"
        width="60%"
        height="60%"
        fill={colors[surface]}
        stroke="none"
      />

        {/* Court number text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          stroke="none"
          fontSize="36"
          fontWeight="bold"            
        >
          {courtNumber}
        </text>
        </g>
      </svg>
    </Box>
  );
});

TennisCourt.propTypes = {
  surface: PropTypes.string.isRequired,
  courtName: PropTypes.string.isRequired,
};

TennisCourt.displayName = 'TennisCourt';

export default TennisCourt;
