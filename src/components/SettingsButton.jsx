import React, { useState } from 'react';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

const SettingsButton = ({ mode, setMode }) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(i18n.language);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const handleThemeChange = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <div>
      <IconButton onClick={handleClickOpen} color="inherit" title={t('Settings')}>
        <SettingsIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t('Settings')}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('Language')}</InputLabel>
            <Select value={language} onChange={handleLanguageChange}>
              <MenuItem value="en">{t('English')}</MenuItem>
              <MenuItem value="de">{t('German')}</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={handleThemeChange} fullWidth>
            {mode === 'light' ? t('Switch to Dark Mode') : t('Switch to Light Mode')}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SettingsButton;
