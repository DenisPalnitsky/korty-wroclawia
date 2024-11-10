
import ClubViewer from "./components/ClubViewer";
import CourtPricingSystem from "./CourtPricingSystem";
import courtsData from './assets/courts.yaml';
import { ThemeProvider, Container, Typography,createTheme } from '@mui/material';

const lightTheme = createTheme(); 

function App  () {

  console.log(courtsData);
  const system = new CourtPricingSystem(courtsData);
  return (
    <ThemeProvider
      theme={lightTheme}  >
      <Container maxWidth="lg">
          <Typography variant="h5" gutterBottom>
            Tennis Court Price Comparison
          </Typography>

        <ClubViewer pricingSystem={system} />
      </Container>
    </ThemeProvider>
  );
}


export default App;
