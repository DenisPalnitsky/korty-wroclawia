// Tennis theme constants
export const TennisPallet = {   
      tennisYellow: '#CFB53B', // Tennis ball color
      hard: '#1B4F72',    // Hard court
      clay: '#A93226',     // Clay court
      grass: '#196F3D',   // Grass court   
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
