import * as React from 'react';
import PropTypes from 'prop-types';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function OrderBySelector({ onOrderChange }) {
  const [order, setOrder] = React.useState('price');
  const { t } = useTranslation();

  const handleChange = (event) => {
    const newOrder = event.target.value;
    setOrder(newOrder);
    if (onOrderChange) {
      onOrderChange(newOrder);
    }
  };

  const getIcon = (orderType) => {
    switch (orderType) {
      case 'club':
        return <SortByAlphaIcon fontSize="small" />;
      case 'price':
        return <AttachMoneyIcon fontSize="small" />;
      case 'distance':
        return <LocationOnIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <FormControl sx={{ m: 0, mr:1, minWidth: 150, }} size="small">
      {/* <InputLabel id="order-by-input">{t("Sort by")}</InputLabel> */}
      <Select
        labelId="order-by-select"
        id="order-by-select"
        value={order}
        sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }, }}
        onChange={handleChange}
        renderValue={(value) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getIcon(value)}
            <Typography variant="body2">
              {value === 'club' && t('Order by club')}
              {value === 'price' && t('Order by price')}
              {value === 'distance' && t('Order by distance')}
            </Typography>
          </Box>
        )}
      >
        <MenuItem value={'club'}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SortByAlphaIcon fontSize="small" />
            <Typography variant="body2">{t('Order by club')}</Typography>
          </Box>
        </MenuItem>
        <MenuItem value={'price'}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoneyIcon fontSize="small" />
            <Typography variant="body2">{t('Order by price')}</Typography>
          </Box>
        </MenuItem>
        <MenuItem value={'distance'}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon fontSize="small" />
            <Typography variant="body2">{t('Order by distance')}</Typography>
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  );
}

OrderBySelector.propTypes = {
    onOrderChange: PropTypes.func.isRequired,
  };