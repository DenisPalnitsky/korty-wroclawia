
import ClubViewer from "./components/ClubViewer";
import CourtPricingSystem from "./CourtPricingSystem";
import courtsData from './assets/courts.yaml';

function App  () {
  // const [pricingSystem, setPricingSystem] = useState(null);

  // useEffect(() => {
  //   fetch(courtsDataUrl)
  //     .then(response => response.text())
  //     .then(text => {
  //       const data = yaml.load(text);
  //       const system = new CourtPricingSystem(data);
  //       setPricingSystem(system);
  //     })
  //     .catch(error => console.error('Error loading YAML file:', error));
  // }, []);

  // if (!pricingSystem) {
  //   return <div>Loading...</div>;
  // }


  console.log(courtsData);
  const system = new CourtPricingSystem(courtsData);
  return (
    <ClubViewer pricingSystem={system} />
  );
}


export default App;
