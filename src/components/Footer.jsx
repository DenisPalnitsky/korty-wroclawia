import React from 'react';
import { Box, Link, Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import BugReportIcon from '@mui/icons-material/BugReport';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: 4,
        backgroundColor: 'white',
        borderTop: '1px solid',
        borderColor: 'grey.200',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Box>
        <Button
          href="https://github.com/denispalnitsky/korty-wroclawia/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<BugReportIcon />}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'grey.400',
            color: 'grey.700',
            '&:hover': {
              borderColor: 'grey.600',
              backgroundColor: 'grey.50'
            }
          }}
        >
          Report Problem
        </Button>
      </Box>

      <Link
        href="https://github.com/denispalnitsky/korty-wroclawia"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: 'black',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          }
        }}
      >
        <GitHubIcon sx={{ fontSize: 28 }} />
      </Link>
    </Box>
  );
}

export default Footer;