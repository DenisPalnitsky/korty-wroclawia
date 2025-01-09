export default Theme ={
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
  }