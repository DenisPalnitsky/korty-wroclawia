# Korty Wrocławia

Korty Wrocławia is a web application that provides information about tennis courts in Wrocław, Poland. The application allows users to view details about various tennis clubs, including court types, surfaces, prices, and availability. Users can also sort and filter the courts based on their preferences.

## Features

- View detailed information about tennis courts in Wrocław
- Filter courts by type, surface, and availability
- Sort courts by price or club name
- View court prices for specific dates and times
- Integration with Google Maps for easy navigation to the clubs
- Multilingual support (Polish and English)
- Map tab to view all courts and prices on Google Maps

## Running the Project Locally

To run the project locally, follow these steps:

1. **Clone the repository:**
   ```sh
   git clone https://github.com/DenisPalnitsky/korty-wroclawia.git
   cd korty-wroclawia
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up Google Maps API Key:**
   - Obtain a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a `.env` file in the root directory of the project.
   - Add the following line to the `.env` file:
     ```
     REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
     ```

4. **Run the development server:**
   ```sh
   npm run dev
   ```

## License

This project is licensed under the MIT License.
