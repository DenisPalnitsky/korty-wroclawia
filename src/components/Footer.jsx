import { Box, Link, Button, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useTranslation } from 'react-i18next';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();

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
          href="https://forms.gle/AAz9NTmnSYhfxGRJ9"
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<ThumbDownAltIcon />}
          endIcon={<ThumbUpAltIcon />}
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
          {t('Report Problem')}
        </Button>
      </Box>

      <Box>
        <Link
          component={RouterLink}
          to="/disclaimer"
          sx={{
            textDecoration: 'underline',
            color: 'inherit',
          }}
        >
          <Typography variant="body2">
            {t('Disclaimer')}
          </Typography>
        </Link>
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
