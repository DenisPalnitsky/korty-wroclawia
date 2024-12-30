import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Disclaimer = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant='h1' align='center'>{t('Disclaimer')}</Typography>
      <Typography dangerouslySetInnerHTML={{ __html: t('disclaimer_content') }}></Typography>
    </Box>
  );
};

export default Disclaimer;
