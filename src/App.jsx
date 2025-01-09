import { useState, useMemo, useEffect } from 'react';
import ClubViewer from './components/ClubViewer';
import { CourtPricingSystem } from './CourtPricingSystem';
import courtsData from './assets/courts.yaml';
import { ThemeProvider, Container, Typography, createTheme, IconButton, Box, useTheme, useMediaQuery, Menu, MenuItem } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { TennisPallet } from './lib/consts';
import Footer from './components/Footer';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga4';
import ErrorBoundary from './components/ErrorBoundary';
import { HashRouter , Route, Routes, Navigate } from 'react-router-dom';
import Disclaimer from './components/Disclaimer';
import i18n from './i18n';
import pl from './assets/images/pl.svg';
import en from './assets/images/en.svg';
import de from './assets/images/de.svg';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const languageImages = {
  pl: pl,
  en: en,
  de: de
};

function App() {
  const { t } = useTranslation();
  const [mode, setMode] = useState(localStorage.getItem('themeMode'));
  const [language, setLanguage] = useState(localStorage.getItem('language'));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const appTheme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: TennisPallet.hard,
        light: '#2874A6',
        dark: '#154360',
      },
      secondary: {
        main: TennisPallet.clay,
        light: '#F4D03F',
        dark: '#B7950B',
      },
      background: {
        default: mode === 'light' ? '#FFFFFF' : '#121212',
        paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
      },
      text: {
        primary: mode === 'light' ? '#000000' : '#FFFFFF',
        secondary: mode === 'light' ? '#424242' : '#B0B0B0',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        color: mode === 'light' ? '#000000' : '#FFFFFF',
        fontSize: isMobile ? '2rem' : '2.5rem',
      },
      h2: {
        fontWeight: 700,
        color: mode === 'light' ? '#000000' : '#FFFFFF',
        fontSize: isMobile ? '1.75rem' : '2rem',
      },
      h3: {
        fontWeight: 600,
        color: mode === 'light' ? '#000000' : '#FFFFFF',
        fontSize: isMobile ? '1.5rem' : '1.75rem',
      },
      h4: {
        fontWeight: 600,
        color: mode === 'light' ? '#000000' : '#FFFFFF',
        fontSize: isMobile ? '1.25rem' : '1.5rem',
      },
      h5: {
        fontWeight: 600,
        color: mode === 'light' ? '#000000' : '#FFFFFF',
        fontSize: isMobile ? '1rem' : '1.25rem',
      },
      h6: {
        fontWeight: 600,
        color: mode === 'light' ? '#000000' : '#FFFFFF',
        fontSize: isMobile ? '0.875rem' : '1rem',
      },
      body1: {
        fontWeight: 400,
        color: mode === 'light' ? '#000000' : '#FFFFFF',
        fontSize: isMobile ? '0.875rem' : '1rem',
      },
      body2: {
        fontWeight: 400,
        color: mode === 'light' ? '#424242' : '#B0B0B0',
        fontSize: isMobile ? '0.75rem' : '0.875rem',
      },
      subtitle1: {
        fontWeight: 500,
        color: mode === 'light' ? '#000000' : '#FFFFFF',
        fontSize: isMobile ? '0.875rem' : '1rem',
      },
      subtitle2: {
        fontWeight: 500,
        color: mode === 'light' ? '#424242' : '#B0B0B0',
        fontSize: isMobile ? '0.75rem' : '0.875rem',
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
      caption: {
        fontSize: isMobile ? '0.625rem' : '0.75rem',
        color: mode === 'light' ? '#666666' : '#999999',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderLeft: `4px solid ${TennisPallet.clay}`,
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
            boxShadow: mode === 'light' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
          },
        },
      },
    },
  }), [mode, isMobile]);

  const system = new CourtPricingSystem(courtsData);

  useEffect(() => {
    const handleLocationChange = () => {
      ReactGA.send({
        hitType: "pageview",
        page: window.location.pathname + window.location.search
      });
    };

    // Track initial pageview
    handleLocationChange();

    // Listen for location changes
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = mode === 'light' ? '#FFFFFF' : '#121212';

    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    localStorage.setItem('language', language);
  }, [mode, language]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    handleClose();
  };

  return (
    <HelmetProvider>

    <ThemeProvider theme={appTheme}>
      <Helmet>
        <title>{t('meta_title')}</title>
        <meta name="description" content={t('meta_description')} />
      </Helmet>

      <ErrorBoundary>
        <HashRouter>
          <Container maxWidth="lg" sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            pt: isMobile ? 1 : 3,
            pb: 6,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              width: '100%',
            }}>

              <Typography variant="h3">
                {t('Courts of Wroclaw')}
              </Typography>

              <Box>
                <IconButton
                  onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                  color="inherit"
                  title={t('Change mode')}
                >
                  {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon sx={{ color: 'white' }} />}
                </IconButton>
                <IconButton
                  onClick={handleClick}
                  color="inherit"
                  title={t('Change language')}
                >
                  <img src={languageImages[language]} alt={language} width="24" height="24" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => handleLanguageChange('pl')}>
                    <img src={pl} alt="Polish" width="24" height="24" />
                    <Typography variant="body1" sx={{ ml: 1 }}>Polski</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleLanguageChange('en')}>
                    <img src={en} alt="English" width="24" height="24" />
                    <Typography variant="body1" sx={{ ml: 1 }}>English</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleLanguageChange('de')}>
                    <img src={de} alt="German" width="24" height="24" />
                    <Typography variant="body1" sx={{ ml: 1 }}>Deutsch</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
            <Routes>
              <Route path="/" element={<Navigate to="/list" />} />
              <Route path="/list" element={<ClubViewer pricingSystem={system} isMobile={isMobile} view="list" />} />
              <Route path="/map" element={<ClubViewer pricingSystem={system} isMobile={isMobile} view="map" />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path='assets/*' element={<Navigate to="/" />} />
            </Routes>
            <Footer />
          </Container>
        </HashRouter>
      </ErrorBoundary>
    </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
