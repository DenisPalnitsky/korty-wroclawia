import { useState } from "react";
import { Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import "./App.css";

function App() {
  
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
