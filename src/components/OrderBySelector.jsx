import * as React from 'react';
import PropTypes from 'prop-types';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';

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

  return (
    <FormControl sx={{ m: 0, mr:1, minWidth: 150, }} size="small">
      {/* <InputLabel id="order-by-input">{t("Sort by")}</InputLabel> */}
      <Select
        labelId="order-by-select"
        id="order-by-select"
        value={order}        
        sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }, }}
        onChange={handleChange}>        
        <MenuItem value={'club'}>  <Typography variant="body2"> {t('Order by club')}</Typography> </MenuItem>        
        <MenuItem value={'price'}> <Typography variant="body2">{t('Order by price')}</Typography></MenuItem>
        <MenuItem value={'distance'}> <Typography variant="body2">{t('Order by distance')}</Typography></MenuItem>
      </Select>
    </FormControl>
  );
}

OrderBySelector.propTypes = {
    onOrderChange: PropTypes.func.isRequired,
  };