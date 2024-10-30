import { useState } from "react";
import { Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import Instructions from "./components/instructions";
import "./App.css";

function App() {
  const tennisCourts = [
    {
        "name": "Matchpoint Wrocław",
        "address": "ul. Księcia Witolda 1, Wrocław",
        "googleMapsLink": "https://www.matchpoint.com.pl/en/offer/tennis/",
        "courtGroups": [
            { "count": 8, "price": "70 PLN/godzina", "surface": "Rebound Ace", "type": "indoor" }
        ]
    },
    {
        "name": "Pałac Brzeźno",
        "address": "ul. Brzeźno 1, Wrocław",
        "googleMapsLink": "https://palacbrzezno.pl/en/tennis/",
        "courtGroups": [
            { "count": 3, "price": "50 PLN/godzina", "surface": "hard", "type": "outdoor" }
        ]
    },
    {
        "name": "Tennis Club Wrocław",
        "address": "Aleja Ignacego Jana Paderewskiego 2, Wrocław",
        "googleMapsLink": "https://tennisround.com/pl/tennis-courts/wojewodztwodolnoslaskie/wroclaw",
        "courtGroups": [
            { "count": 14, "price": "60 PLN/godzina", "surface": "hard", "type": "indoor" },
            { "count": 2, "price": "55 PLN/godzina", "surface": "clay", "type": "outdoor" }
        ]
    },
    {
        "name": "Tennis Courts in Wrocław",
        "address": "Various locations, Wrocław",
        "googleMapsLink": "https://www.globaltennisnetwork.com/tennis-courts/courts/city/21244-wroclaw-poland",
        "courtGroups": [
            { "count": 5, "price": "65 PLN/godzina", "surface": "clay", "type": "outdoor" },
            { "count": 3, "price": "75 PLN/godzina", "surface": "hard", "type": "indoor" }
        ]
    },
    {
        "name": "Tennis Club Wrocław - OSiR",
        "address": "ul. Kłokoczyn 1, Wrocław",
        "googleMapsLink": "https://www.osir.wroclaw.pl/",
        "courtGroups": [
            { "count": 4, "price": "45 PLN/godzina", "surface": "hard", "type": "outdoor" }
        ]
    },
    {
        "name": "Tennis Academy Wrocław",
        "address": "ul. Włodkowica 7, Wrocław",
        "googleMapsLink": "https://tennisacademy.pl/",
        "courtGroups": [
            { "count": 6, "price": "80 PLN/godzina", "surface": "hard", "type": "indoor" }
        ]
    },
    {
        "name": "KKT Wrocław",
        "address": "ul. Słowiańska 1, Wrocław",
        "googleMapsLink": "https://kktwroclaw.pl/",
        "courtGroups": [
            { "count": 3, "price": "55 PLN/godzina", "surface": "clay", "type": "outdoor" },
            { "count": 2, "price": "65 PLN/godzina", "surface": "hard", "type": "indoor" }
        ]
    },
    {
        "name": "Tenisowy Klub Sportowy Wrocław",
        "address": "ul. Poniatowskiego 2, Wrocław",
        "googleMapsLink": "https://www.tenisowyklub.pl/",
        "courtGroups": [
            { "count": 2, "price": "50 PLN/godzina", "surface": "grass", "type": "outdoor" },
            { "count": 2, "price": "60 PLN/godzina", "surface": "hard", "type": "indoor" }
        ]
    }
    // Add more clubs and courts as needed
];


  return (
    <div className="container">
      <h1>Korty Tenisowe we Wrocławiu</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Google Maps</TableCell>
              <TableCell>Map</TableCell>
              <TableCell>Courts</TableCell>
              <TableCell>Price Range (PLN/godzina)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tennisCourts.map((court, index) => (
              <TableRow key={index}>
                <TableCell>{court.name}</TableCell>
                <TableCell>{court.address}</TableCell>
                <TableCell>
                  <a href={court.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    View on Google Maps
                  </a>
                </TableCell>
                <TableCell>
                  {(() => {
                    const prices = court.courtGroups.map(group => parseFloat(group.price.split(' ')[0]));
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    return `${minPrice} - ${maxPrice}`;
                  })()}
                </TableCell>
                <TableCell>
                  <svg
                    width="100"
                    height="100"
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-24 h-24"
                  >
                    <path
                      d="M10,10 L190,10 L190,190 L10,190 Z M50,50 Q100,10 150,50 T190,150 Q150,190 100,150 T50,50 Z"
                      fill="#e0e0e0"
                      stroke="#c0c0c0"
                      strokeWidth="2"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="5"
                      fill="red"
                      stroke="black"
                      strokeWidth="1"
                    />
                    <text x="10" y="190" fontSize="10" fill="black">
                      {court.name}
                    </text>
                  </svg>
                </TableCell>
                <TableCell>
                  {court.courtGroups.map((group, idx) =>
                    Array.from({ length: group.count }).map((_, i) => (
                      <Tooltip
                        key={`${idx}-${i}`}
                        title={`${group.count} x ${group.surface.charAt(0).toUpperCase() + group.surface.slice(1)}: ${group.price}`}
                        arrow
                      >
                        <div
                          className={`inline-block w-6 h-6 m-1 ${
                            group.surface === "clay"
                              ? "bg-orange-500"
                              : group.surface === "hard"
                              ? "bg-blue-500"
                              : group.surface === "carpet"
                              ? "bg-gray-500"
                              : "bg-green-500"
                          }`}
                        ></div>
                      </Tooltip>
                    ))
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default App;
