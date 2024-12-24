import { useTranslation } from 'react-i18next';
import { Button, Box, Typography } from '@mui/material';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import BugReportIcon from '@mui/icons-material/BugReport';
import ReplayIcon from '@mui/icons-material/Replay';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ErrorPage = () => {
  const { t } = useTranslation();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Box className="container text-center p-5" display="flex" flexDirection="column" alignItems="center">
      <ErrorOutlineIcon color="error" style={{ fontSize: 50, marginBottom: 16 }} />
      <Typography variant="h4" component="h1" className="font-bold mb-4">
        {t('Something went wrong')}
      </Typography>
      <Typography variant="body1" className="mb-4" color="textSecondary">
        {t("We're sorry, but something went wrong. Please try again later.")}
      </Typography>

      <Box className="mb-4">
        <Button onClick={handleReload} variant="outlined" startIcon={<ReplayIcon />}
        sx={{
          width: '200px',
          mb: 2,
          mt: 2
        }}
        >
          {t('Reload Page')}
        </Button>
      </Box>
      <Box className="mt-4">
        <Button
          href="https://forms.gle/AAz9NTmnSYhfxGRJ9"
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<BugReportIcon />}
          variant="outlined"
          sx={{
            width: '200px'
          }}
        >
          {t('Report this problem')}
        </Button>
      </Box>
    </Box>
  );
};

export default ErrorPage;
