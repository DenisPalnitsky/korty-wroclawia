import {
    Grid2,
    Tooltip,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableRow
} from '@mui/material';
import PropTypes from 'prop-types';
import { CourtGroup } from '../CourtPricingSystem';
import { getCourtColor, getCourtColorDark } from '../lib/consts';
import TennisCourt from './TennisCourt';
import { useTranslation } from 'react-i18next';
import AcUnitIcon from '@mui/icons-material/AcUnit';

const CourtGroupRow = ({ courtGroup, groupIndex, isMobile, startTime, endTime, showClosedCourts }) => {
    const { t } = useTranslation();

    const isClosed =  courtGroup.isClosed(startTime);

    if (isClosed && !showClosedCourts) {
        return null;
    }

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
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        {t('Court type')}: {`${t(courtGroup.surface)} | ${t(courtGroup.type)} `}
                    </Typography>
                ) : (
                    <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {t('Court type')}: {t(courtGroup.type)}
                        </Typography>                                                

                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {t('Surface')}: {t(courtGroup.surface)}
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
                <Box
                    sx={{
                        borderRadius: 1,
                        bgcolor: getCourtColor(courtGroup.surface),                        
                        width: isMobile ? '100%' : '120px',
                        padding: isMobile ? 'auto' : '8px 16px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '40px',
                        '&:hover': {
                            bgcolor: getCourtColorDark(courtGroup.surface),
                        },
                        position: 'relative',
                    }}
                >
                    <Typography variant="body1" sx={{ color: 'white' }}>
                        {courtGroup.getPrice(startTime, endTime)} zl
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', color: 'lightgray', }}>
                         {courtGroup.getPrice(startTime, new Date(startTime.getTime() + 60 * 60 * 1000))} zl/{t('hour')}
                    </Typography>

                    {(courtGroup.heating === false && 
                        (new Date().getMonth() >= 10 || // November (0-based months)
                        new Date().getMonth() <= 4)) && ( // May
                            <Tooltip title={t('No heating')} >
                            <AcUnitIcon sx={{ color: '#68DBF2', 
                                position: 'absolute',
                                top: '5px',
                                left: '5px', }} fontSize='small' /> 
                            </Tooltip>
                        )
                    }


                </Box>) : ( 
                    
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

            <Grid2 id="court-avg-prices-grid" size={isMobile ? 12 : 'auto'} hidden={isClosed} flexGrow={1}>
                <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    ml: 3,
                    py: 0.5,
                    px: 2,
                }}>
                    <Table sx={{ 
                        width: 'auto',
                        '& td': { 
                            border: 'none',
                            padding: '2px 0',
                            whiteSpace: 'nowrap',
                            fontSize: '0.875rem',
                            color: 'text.secondary'
                        },
                        '& td:first-of-type': {
                            paddingRight: 3
                        }
                    }}>
                        <TableBody>
                            <TableRow>
                                <TableCell rowSpan={2}>
                                    {t('Price range')}
                                </TableCell>
                                <TableCell>
                                    {t('weekdays')}: {courtGroup.getMinMaxPriceForWeekday(startTime)?.minPrice} - {courtGroup.getMinMaxPriceForWeekday(startTime)?.maxPrice} zł
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    {t('weekends')}: {courtGroup.getMinMaxPriceForWeekend(startTime)?.minPrice} - {courtGroup.getMinMaxPriceForWeekend(startTime)?.maxPrice} zł
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>
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
    endTime: PropTypes.instanceOf(Date).isRequired,
    showClosedCourts: PropTypes.bool.isRequired,
};

export default CourtGroupRow;
