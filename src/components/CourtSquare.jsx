import React from 'react';

const CourtSquareWithLines = ({ surface }) => {
  const styles = {
    court: {
      width: 60,
      height: 80,
      margin: 4,
      border: '0px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      backgroundColor: surface === 'clay' ? '#ff8c69' : '#4169e1',
      color: '#fff',
      position: 'relative',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.05)',
      }
    },
    courtLine: {
      position: 'absolute',
      backgroundColor: '#fff',
    },
    // Full-width lines
    baseline: {
      position: 'absolute',
      backgroundColor: '#fff',
      width: '100%',
      height: '2px',
      top: 0,
    },
    baselineBottom: {
      position: 'absolute',
      backgroundColor: '#fff',
      width: '100%',
      height: '2px',
      bottom: 0,
    },
    netLine: {
      position: 'absolute',
      backgroundColor: '#fff',
      width: '100%',
      height: '2px',
      top: '50%',
    },
    // Vertical lines
    sidelineLeft: {
      position: 'absolute',
      backgroundColor: '#fff',
      width: '2px',
      height: '100%',
      left: '15%',
    },
    sidelineRight: {
      position: 'absolute',
      backgroundColor: '#fff',
      width: '2px',
      height: '100%',
      right: '15%',
    },
    corridorLeft: {
      position: 'absolute',
      backgroundColor: '#fff',
      width: '2px',
      height: '100%',
      left: 0,
    },
    corridorRight: {
      position: 'absolute',
      backgroundColor: '#fff',
      width: '2px',
      height: '100%',
      right: 0,
    },
    // Service lines (between sidelines only)
    serviceLine: {
      position: 'absolute',
      backgroundColor: '#fff',
      width: '70%',
      height: '2px',
      top: '30%',
      left: '15%',
    },
    serviceLineBottom: {
      position: 'absolute',
      backgroundColor: '#fff',
      width: '70%',
      height: '2px',
      top: '70%',
      left: '15%',
    },
    // Center service line
    centerServiceLine: {
      position: 'absolute',
      backgroundColor: '#fff',
      width: '2px',
      height: '40%',  // This will span between service lines (from 30% to 70%)
      top: '30%',     // Aligns with top service line
      left: '50%',    // Centers the line
      transform: 'translateX(-50%)', // Ensures perfect centering
    },
  };

  return (
    <div style={styles.court}>
      {/* Full-width lines */}
      <div style={styles.baseline} />
      <div style={styles.baselineBottom} />
      <div style={styles.netLine} />
      
      {/* Vertical lines */}
      <div style={styles.sidelineLeft} />
      <div style={styles.sidelineRight} />
      <div style={styles.corridorLeft} />
      <div style={styles.corridorRight} />
      
      {/* Service lines (between sidelines only) */}
      <div style={styles.serviceLine} />
      <div style={styles.serviceLineBottom} />
      
      {/* Center service line */}
      <div style={styles.centerServiceLine} />
    </div>
  );
};

export default CourtSquareWithLines;