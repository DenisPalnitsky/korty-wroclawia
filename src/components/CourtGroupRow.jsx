import {
    Grid2,
    Tooltip,
    Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { CourtGroup } from '../CourtPricingSystem';
import { getCourtColor, getCourtColorDark } from '../lib/consts';
import TennisCourt from './TennisCourt';
import { useTranslation } from 'react-i18next';

const CourtGroupRow = ({ courtGroup, groupIndex, isMobile, startTime, endTime }) => {
    const { t } = useTranslation();
    const isClosed =  courtGroup.isClosed(startTime);

    return (
        <Grid2 id="CourtGroupRow-main" container spacing={2} key={groupIndex}
            sx={{                
                padding: 1,
                mb: 1,
                display: 'flex',
                alignItems: 'flex-start',            
                borderColor: getCourtColor(courtGroup.surface),                
                borderRight: 'none',
                borderTop: 'none',
                borderBottom: 'none',
            }}>
            
            
            <Grid2 id="court-type-grid" size={ isMobile ? 12 : 3 }>
                { isMobile || isClosed ? (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        {t('Court type')}: {`${courtGroup.surface} | ${courtGroup.type} `}
                    </Typography>
                ) : (
                    <>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            {t('Court type')}: {courtGroup.type}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            {t('Surface')}: {courtGroup.surface}
                        </Typography>
                    </>
                )}
            </Grid2>

            <Grid2 id="court-price-grid" size={isMobile ? 12 : 2} sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
            }}>

                {!isClosed ? (   
                    <Typography
                        variant="subtitle1"
                        sx={{
                            borderRadius: 1,
                            bgcolor: getCourtColor(courtGroup.surface),
                            color: 'white',
                            width: isMobile ? '100%' : '120px',
                            padding: isMobile ? 'auto' : '8px 16px',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '40px',
                            '&:hover': {
                                bgcolor: getCourtColorDark(courtGroup.surface),
                            },
                        }}>
                   {t('Price')}: {courtGroup.getPrice(startTime, endTime)} PLN                    
                   </Typography> ) : ( 
                    
                    <Typography
                        variant="subtitle1"
                        sx={{
                            borderRadius: 1,
                            bgcolor: getCourtColor(courtGroup.surface),
                            color: 'white',
                            width: isMobile ? '100%' : '120px',
                            padding: isMobile ? 'auto' : '4px 16px',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            
                            '&:hover': {
                                bgcolor: getCourtColorDark(courtGroup.surface),
                            },
                        }}>{t('Closed')}</Typography> 
                        )}
              
            </Grid2>

            <Grid2 id="court-avg-prices-grid" size={ isMobile ? 12 : 'auto'} hidden={isClosed} flexGrow={1}>
                <Typography variant="body1">
                    {t('Price range on weekdays')}: {courtGroup.getMinMaxPriceForWeekday(startTime)?.minPrice + " - " + courtGroup.getMinMaxPriceForWeekday(startTime)?.maxPrice} PLN
                </Typography>
                <Typography variant="body1">
                    {t('Price range on weekends')}: {courtGroup.getMinMaxPriceForWeekend(startTime)?.minPrice + " - " + courtGroup.getMinMaxPriceForWeekend(startTime)?.maxPrice} PLN
                </Typography>
            </Grid2>

            <Grid2 id="courts-tiles-grid" container size={ isMobile ? 12 : 'auto'} spacing={1}
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    marginLeft: 'auto',
                    marginRight: isMobile ? 0 : 1,
                    padding: 1,
                    width: 'auto',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}>
                {courtGroup.courts.map((court) => {
                    const price = courtGroup.getPrice(startTime, endTime);
                    return (
                        <Tooltip
                            key={court.id}
                            title={price ? `${t('Court')} ${court.id}: ${price} PLN` : t('Price not available')}
                        >
                            <TennisCourt surface={court.surface} courtName={court.id} scale={isClosed ? 0.5 : 1 }>
                                {court.id}
                            </TennisCourt>
                        </Tooltip>
                    );
                })}
            </Grid2>
        </Grid2>
    );
};

CourtGroupRow.propTypes = {
    courtGroup: PropTypes.instanceOf(CourtGroup).isRequired,
    groupIndex: PropTypes.number.isRequired,
    isMobile: PropTypes.bool.isRequired,
    startTime: PropTypes.instanceOf(Date).isRequired,
    endTime: PropTypes.instanceOf(Date).isRequired
};

export default CourtGroupRow;
