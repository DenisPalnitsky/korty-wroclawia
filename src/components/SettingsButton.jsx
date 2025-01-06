import React, { useState, useEffect } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import FlagIcon from '@mui/icons-material/Flag';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

const SettingsButton = ({ mode, setMode }) => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const savedMode = Cookies.get('mode');
    const savedLanguage = Cookies.get('language');
    if (savedMode) {
      setMode(savedMode);
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
  }, [setMode, i18n]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    Cookies.set('language', newLanguage);
  };

  const handleThemeChange = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    Cookies.set('mode', newMode);
  };

  return (
    <div>
      <IconButton onClick={handleClick} color="inherit" title={t('Settings')}>
        <SettingsIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleThemeChange}>
          <ListItemIcon>
            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </ListItemIcon>
          <ListItemText primary={mode === 'light' ? t('Switch to Dark Mode') : t('Switch to Light Mode')} />
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange('en')}>
          <ListItemIcon>
            <FlagIcon />
          </ListItemIcon>
          <ListItemText primary={t('English')} />
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange('de')}>
          <ListItemIcon>
            <FlagIcon />
          </ListItemIcon>
          <ListItemText primary={t('German')} />
        </MenuItem>
      </Menu>
    </div>
  );
};

export default SettingsButton;
