# Korty Wrocławia - Project Documentation

This document provides comprehensive information about the Korty Wrocławia project, including data structures, architecture, and development guidelines.

## Project Overview

**Korty Wrocławia** is a React-based web application that provides information about tennis courts in Wrocław, Poland. The application allows users to view details about various tennis clubs, including court types, surfaces, prices, and availability. Users can also sort and filter the courts based on their preferences.

### Key Features
- View detailed information about tennis courts in Wrocław
- Filter courts by type, surface, and availability
- Sort courts by price or club name
- View court prices for specific dates and times
- Integration with Google Maps for easy navigation to the clubs
- Multilingual support (Polish, English, German)
- Dark/Light theme support
- Mobile-responsive design

### Live Application
- **URL**: https://wkt.wroclaw.pl/
- **Repository**: https://github.com/DenisPalnitsky/korty-wroclawia

## Technology Stack

### Core Technologies
- **React 18.2.0** - Frontend framework
- **Vite 5.4.10** - Build tool and development server
- **Material-UI (MUI) 6.1.6** - UI component library
- **React Router DOM 7.1.1** - Client-side routing
- **Tailwind CSS 3.4.0** - Utility-first CSS framework

### Key Dependencies
- **react-i18next 15.1.3** - Internationalization
- **@vis.gl/react-google-maps 1.4.2** - Google Maps integration
- **date-fns 4.1.0** - Date manipulation
- **date-holidays 3.23.13** - Holiday calculation
- **js-yaml 4.1.0** - YAML parsing
- **react-ga4 2.1.0** - Google Analytics
- **react-helmet-async 2.0.5** - SEO management

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Mocha** - Testing framework
- **Chai** - Assertion library
- **@babel/core** - JavaScript transpilation

## Project Structure

```
src/
├── assets/
│   ├── courts.yaml          # Main data file
│   └── images/              # Language flags and assets
├── components/              # React components
│   ├── ClubViewer.jsx       # Main court listing component
│   ├── CourtGroupRow.jsx    # Individual court group display
│   ├── MapTab.jsx          # Map view component
│   ├── Disclaimer.jsx      # Legal disclaimer
│   └── ...                 # Other UI components
├── lib/
│   └── consts.js           # Theme and color constants
├── locales/                # Translation files (empty - using i18n.js)
├── styles/
│   └── App.css            # Global styles
├── tests/                 # Test files
├── App.jsx               # Main application component
├── main.jsx             # Application entry point
├── i18n.js              # Internationalization configuration
└── CourtPricingSystem.js # Core pricing logic
```

## Courts YAML Format Documentation

The `courts.yaml` file contains comprehensive information about tennis courts and clubs in Wrocław, Poland. It follows a hierarchical structure where each club can have multiple court groups, each with different surfaces, types, and pricing schedules.

## Root Structure

The file is a YAML array of court club objects. Each club entry contains the following top-level properties:

```yaml
- name: "Club Name"                    # Human-readable club name
  id: "club-identifier"               # URL-friendly identifier
  address: "Full Address"             # Complete street address
  googleMapsLink: "https://..."       # Google Maps URL
  website: "https://..."              # Club's official website
  partnerCards:                       # Array of accepted partner cards
    - "multisport-plus"
    - "multisport-classic"
    - "medicover"
    - "fit-profit"
    - "pzu-sport"
  courts:                             # Array of court groups
    - # Court group definition (see below)
  coordinates:                        # GPS coordinates
    lat: 51.1234567
    long: 17.1234567
```

## Court Groups Structure

Each court group represents a collection of courts with the same surface type, court type, and pricing structure:

```yaml
- surface: "hard|clay|artificial-grass|carpet|grass"  # Court surface type
  type: "indoor|outdoor|tent|baloon"                  # Court enclosure type
  light: true|false                                   # Optional: lighting availability
  heating: true|false                                 # Optional: heating availability
  reservationLink: "https://..."                      # Booking URL (can use YAML anchors)
  courts:                                             # Array of court identifiers
    - "1"
    - "2"
    - "C"                                             # Can be numbers or letters
  prices:                                             # Array of pricing periods
    - # Price period definition (see below)
```

### Surface Types
- `hard`: Hard court surface (typically acrylic or similar)
- `clay`: Clay court surface (red clay)
- `artificial-grass`: Synthetic grass surface
- `carpet`: Carpet surface
- `grass`: Natural grass surface

### Court Types
- `indoor`: Fully enclosed indoor courts
- `outdoor`: Open-air courts
- `tent`: Temporary tent-covered courts
- `baloon`: Inflatable dome-covered courts

## Pricing Structure

Each court group contains an array of pricing periods that define different rates for different time ranges:

```yaml
prices:
- from: "2024-05-01"                  # Start date (YYYY-MM-DD format)
  to: "2024-10-01"                    # End date (YYYY-MM-DD format)
  schedule:                           # Time-based pricing rules
    "*:7-15": "60"                    # All days, 7-15h: 60 PLN
    "*:15-23": "80"                   # All days, 15-23h: 80 PLN
    "st:7-15": "80"                   # Saturday, 7-15h: 80 PLN
    "su:00-23": "50"                  # Sunday, 0-23h: 50 PLN
    "hl:7-23": "45"                   # Holiday, 7-23h: 45 PLN
    "!:23-6": "50"                    # Night hours, 23-6h: 50 PLN
```

### Schedule Format

The schedule uses a specific format for time-based pricing:

- `*`: All days of the week except those that are specified in other rules(order does not matter)
- `st`: Saturday
- `su`: Sunday
- `hl`: Holiday
- `!`: All days without exeptions.

Time ranges are specified in 24-hour format (HH-HH), and prices are in Polish Złoty (PLN).

### Special Schedule Values

- `null` or  Empty schedule: indicates the court is not available during that period

## YAML Anchors and References

The file uses YAML anchors (`&anchor_name`) and references (`*anchor_name`) to avoid repetition:

```yaml
reservationLink: &matchpoint_link https://matchpoint.gymmanager.com.pl/ClassroomReservation
# Later referenced as:
reservationLink: *matchpoint_link
```

## Data Quality Notes

1. **Date Formats**: All dates use `YYYY-MM-DD` format
2. **Price Values**: Can be strings (`"60"`) or numbers (`60`)
3. **Court Identifiers**: Can be numeric strings (`"1"`, `"2"`) or letters (`"C"`)
4. **Missing Data**: Some pricing periods may have empty schedules or `null` values
5. **Inconsistencies**: Some entries may have minor formatting inconsistencies (e.g., missing quotes around numbers)

## Example Entry

```yaml
- name: Matchpoint Wrocław
  id: matchpoint
  address: Szyszkowa 6, 55-040 Ślęza
  googleMapsLink: https://maps.app.goo.gl/Dm2WNmwLiSPtBanZ9
  website: https://www.matchpoint.com.pl/
  partnerCards:
    - multisport-plus
  courts:
    - surface: hard
      reservationLink: &matchpoint_link https://matchpoint.gymmanager.com.pl/ClassroomReservation
      type: indoor
      courts:
        - '1'
        - '2'
      prices:
        - from: '2024-05-01'
          to: '2024-10-01'
          schedule:
            '*:7-15': '60'
            '*:15-23': '80'
            '!:23-6': '50'
            st:7-15: '80'
            st:15-23: '60'
            su:00-23: '50'
  coordinates:
    lat: 51.0405727
    long: 16.9859901
```

## Usage in Application

This YAML structure is designed to support:

1. **Court Filtering**: By surface type, court type, lighting, heating
2. **Price Calculation**: Dynamic pricing based on date and time
3. **Partner Card Integration**: Filtering by accepted partner cards
4. **Geographic Features**: Location-based sorting and mapping
5. **Reservation Integration**: Direct links to booking systems

The hierarchical structure allows for flexible querying and filtering while maintaining data consistency across the application.

## Application Architecture

### Core Components

#### 1. CourtPricingSystem.js
The heart of the application's business logic. This module contains:

- **CourtPricingSystem Class**: Main orchestrator for all pricing operations
- **Club Class**: Represents individual tennis clubs with their court groups
- **CourtGroup Class**: Manages groups of courts with same surface/type
- **Court Class**: Individual court instances
- **PricePeriod Class**: Handles time-based pricing rules

**Key Features:**
- Holiday detection using `date-holidays` library
- Half-hour granular pricing calculation
- Date range validation and gap detection
- Comprehensive data validation

#### 2. App.jsx
Main application component featuring:

- **Theme Management**: Dynamic light/dark mode switching
- **Internationalization**: Multi-language support (PL/EN/DE)
- **Routing**: Hash-based routing for GitHub Pages compatibility
- **State Management**: Local storage for user preferences
- **Google Analytics**: Page view tracking

#### 3. ClubViewer.jsx
Primary user interface component providing:

- **Court Listing**: Displays all available courts
- **Filtering**: By surface type, court type, availability
- **Sorting**: By price or club name
- **Date Selection**: Interactive date picker for pricing
- **Map Integration**: Toggle between list and map views

### State Management

The application uses React's built-in state management:

- **Local State**: `useState` for component-level state
- **Local Storage**: Persistent user preferences (theme, language)
- **Context**: Theme provider for global theme access
- **Props**: Data flow between components

### Routing Structure

```
/ (root) → Redirects to /list
/list → Court listing view
/map → Map view with court locations
/disclaimer → Legal disclaimer page
```

## Internationalization (i18n)

### Supported Languages
- **Polish (pl)** - Default language
- **English (en)** - Full translation
- **German (de)** - Full translation

### Translation Structure
All translations are defined in `src/i18n.js` with the following categories:

- **UI Elements**: Buttons, labels, form elements
- **Court Types**: Surface and court type names
- **Time-related**: Duration, hours, days
- **Meta Data**: Page titles and descriptions
- **Error Messages**: User-facing error text

### Date Localization
Uses `date-fns` locales for proper date formatting:
- Polish: `date-fns/locale/pl`
- English: `date-fns/locale/enUS`
- German: `date-fns/locale/de`

## Styling and Theming

### Material-UI Theme
Custom theme configuration in `App.jsx`:

- **Tennis-inspired Color Palette**: Based on court surface colors
- **Responsive Typography**: Mobile-optimized font sizes
- **Dynamic Theming**: Light/dark mode support
- **Custom Components**: Overridden MUI components for tennis theme

### Color System
Defined in `src/lib/consts.js`:

```javascript
TennisPallet = {
  tennisYellow: '#CFB53B',  // Tennis ball color
  hard: '#1B4F72',          // Hard court blue
  clay: '#A93226',          // Clay court red
  grass: '#196F3D',         // Grass court green
  // Dark variants available
}
```

### Tailwind CSS
Used for utility classes and responsive design:
- Mobile-first approach
- Custom breakpoints
- Animation support (optional)

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run preview          # Preview production build

# Building
npm run build            # Create production build
npm run predeploy        # Build before deployment
npm run deploy           # Deploy to GitHub Pages

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode

# Utilities
npm run clean            # Clean dist folder
npm run clean:all        # Clean everything and reinstall
npm run analyze          # Analyze bundle size
npm run build-holidays   # Generate holiday data
```

### Environment Variables

Required environment variables (set in `.env` files):

```bash
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GA_TRACKING_ID=your_google_analytics_id
APP_ENV=production|development
```

### Build Configuration

**Vite Configuration** (`vite.config.js`):
- React plugin for JSX support
- YAML plugin for data loading
- Environment variable injection
- GitHub Pages base path configuration

**Tailwind Configuration** (`tailwind.config.js`):
- Content paths for purging
- Custom theme extensions
- Animation plugin support

## Data Management

### Courts Data
- **Source**: `src/assets/courts.yaml`
- **Format**: YAML with hierarchical structure
- **Validation**: Built-in validation in CourtPricingSystem
- **Updates**: Manual updates to YAML file

### Holiday Data
- **Source**: `date-holidays` library
- **Country**: Poland (PL)
- **Coverage**: Previous, current, and next year
- **Usage**: Pricing calculation for holiday rates

### User Preferences
- **Storage**: Browser localStorage
- **Data**: Theme mode, language selection
- **Persistence**: Survives browser sessions

## Testing Strategy

### Test Structure
```
src/tests/
├── test.js              # Main test file
├── courts_test.yaml     # Test data
└── regression.yaml      # Regression test data
```

### Test Framework
- **Mocha**: Test runner
- **Chai**: Assertion library
- **Babel**: JSX transpilation for tests

### Test Coverage
- Data validation
- Pricing calculations
- Date handling
- Error scenarios

## Deployment

### GitHub Pages
- **Branch**: `gh-pages`
- **Build**: Automated via GitHub Actions
- **URL**: https://wkt.wroclaw.pl/
- **Configuration**: Hash routing for SPA compatibility

### Build Process
1. Install dependencies
2. Run linting and formatting checks
3. Build production bundle
4. Deploy to `gh-pages` branch

## Performance Considerations

### Optimization Strategies
- **Code Splitting**: Vite's automatic code splitting
- **Bundle Analysis**: `vite-bundle-analyzer` for size monitoring
- **Lazy Loading**: React.lazy for component splitting
- **Image Optimization**: SVG flags for language selection

### Caching
- **Static Assets**: Long-term caching for assets
- **API Calls**: Minimal external API usage
- **Local Storage**: User preferences caching

## Security Considerations

### Data Privacy
- **No Personal Data**: Application doesn't collect personal information
- **Public Data Only**: All court data is publicly available
- **GDPR Compliance**: Minimal data collection approach

### External Dependencies
- **Google Maps**: Secure API key usage
- **Google Analytics**: Privacy-focused tracking
- **External Links**: All external links open in new tabs

## Maintenance Guidelines

### Regular Updates
- **Dependencies**: Monthly security updates
- **Court Data**: Quarterly data verification
- **Translations**: As needed for new features

### Data Validation
- **Automated**: Built-in validation in CourtPricingSystem
- **Manual**: Regular spot-checks of court information
- **User Reports**: Contact form for data corrections

### Monitoring
- **Google Analytics**: User behavior tracking
- **Error Tracking**: React Error Boundary for error capture
- **Performance**: Bundle size monitoring

## Contributing Guidelines

### Code Standards
- **ESLint**: Enforced code style
- **Prettier**: Consistent formatting
- **React Best Practices**: Functional components, hooks
- **Accessibility**: WCAG guidelines compliance

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Run linting and formatting
5. Submit pull request

### Data Updates
- **Court Information**: Update `courts.yaml` directly
- **Translations**: Update `i18n.js` for new strings
- **Validation**: Ensure all changes pass validation tests