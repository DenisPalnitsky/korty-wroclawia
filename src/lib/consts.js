// Tennis theme constants
export const TennisPallet = {   
  // Light variants
  tennisYellow: '#CFB53B', // Tennis ball color
  hard: '#1B4F72',         // Hard court
  clay: '#A93226',         // Clay court
  grass: '#196F3D',        // Grass court   
  
  // Dark variants - adjusted for better contrast
  tennisYellowDark: '#8B7B1C', // Deeper tennis ball color
  hardDark: '#0B2D44',         // Darker blue for hard court
  clayDark: '#7C1A1A',         // Deeper red for clay court
  grassDark: '#0B4124',        // Darker green for grass court
};

 export const getCourtColor = (surface) => {
    switch(surface.toLowerCase()) {
      case 'hard':
        return TennisPallet.hard;
      case 'clay':
        return TennisPallet.clay;
      case 'grass':
        return TennisPallet.grass;
      default:
        return TennisPallet.clay;
    }
  };

  export const getCourtColorDark = (surface) => {
    switch(surface.toLowerCase()) {
      case 'hard':
        return TennisPallet.hardDark;
      case 'clay':
        return TennisPallet.clayDark;
      case 'grass':
        return TennisPallet.grassDark;
      default:
        return TennisPallet.tennisYellowDark;
    }
  }
