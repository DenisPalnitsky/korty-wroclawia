import { useTranslation } from 'react-i18next';
import { Button, Box, Typography, TextField } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import ReplayIcon from '@mui/icons-material/Replay';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react';
import PropTypes from 'prop-types';

const ErrorPage = ({ error }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleReload = () => {
    window.location.reload();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(error.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box className="container text-center p-5" display="flex" flexDirection="column" alignItems="center">
      <ErrorOutlineIcon color="error" style={{ fontSize: 50, marginBottom: 16 }} />
      <Typography variant="h3" component="h1" className="font-bold mb-4">
        {t('Something went wrong')}
      </Typography>
      <Typography variant="body1" className="mb-4" color="textSecondary">
        {t("something_went_wrong_message")}
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
      <Box>
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

      
      {error && (
        <Box alignItems="center" sx={{ mt: 4 }}>

          <Typography variant="h6" className="mb-2">
            {t('Error Details:')}
          </Typography>
          <TextField
            value={error.toString()}
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />
          <Button
            onClick={handleCopy}
            variant="contained"
            startIcon={<ContentCopyIcon />}
            sx={{ mt: 2 }}
          >
            {copied ? t('Copied!') : t('Copy to Clipboard')}
          </Button>
        </Box>
      )}

    </Box>
  );
};

ErrorPage.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Error)
  ])
};

export default ErrorPage;
