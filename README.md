# Villa Scheduling System - Frontend

A modern, mobile-first responsive web application for villa scheduling and booking management built with React.js, Redux Toolkit, Tailwind CSS, and FullCalendar.

## 🚀 Features

- **Dashboard** - Comprehensive overview with key metrics and statistics
- **Calendar View** - Interactive calendar with FullCalendar integration
- **Villa Management** - CRUD operations for villa properties
- **Booking Management** - Complete booking lifecycle management
- **Analytics** - Detailed insights with charts and performance metrics
- **Responsive Design** - Mobile-first approach with beautiful UI
- **State Management** - Redux Toolkit with RTK Query for API calls
- **Authentication** - Protected routes with JWT token management

## 📦 Tech Stack

- **React 18** - UI library
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **FullCalendar** - Calendar component
- **Recharts** - Charts and data visualization
- **Heroicons** - Icon library
- **React Hot Toast** - Notifications
- **date-fns** - Date manipulation
- **Vite** - Build tool

## 🛠️ Installation

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running (see villa-backend)

### Steps

1. **Clone the repository**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend API URL:
   ```
   VITE_API_BASE_URL=https://villa-backend-management-production.up.railway.app/api/v1
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components (Button, Card, Badge, etc.)
│   └── layout/           # Layout components (Sidebar, Navbar, MainLayout)
├── features/
│   ├── auth/            # Authentication slice
│   └── ui/              # UI state slice
├── services/
│   └── api/             # RTK Query API definitions
│       ├── apiSlice.js  # Base API configuration
│       ├── villaApi.js  # Villa endpoints
│       └── bookingApi.js # Booking endpoints
├── pages/               # Page components
│   ├── Dashboard.jsx
│   ├── Calendar.jsx
│   ├── Villas.jsx
│   ├── Bookings.jsx
│   ├── Analytics.jsx
│   ├── Settings.jsx
│   ├── Login.jsx
│   └── NotFound.jsx
├── store/               # Redux store configuration
├── App.jsx              # Main app component with routing
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## 🎨 Key Features Explained

### Authentication

- Mock authentication for demo purposes
- JWT token stored in localStorage
- Protected routes with automatic redirect
- Auto-logout on token expiration

### Dashboard

- Real-time statistics from backend
- Villa occupancy metrics
- Revenue tracking
- Recent bookings table
- Today's check-ins/check-outs

### Calendar

- FullCalendar integration
- Month, week, and day views
- Color-coded events by status
- Click events to view details
- Date selection for new bookings

### Villas

- Grid layout with villa cards
- Filter by status (active/maintenance)
- Create, view, and delete villas
- Responsive design

### Bookings

- Comprehensive table view
- Search by client name or phone
- Filter by status
- Delete bookings
- Payment status tracking

### Analytics

- Revenue trend charts (6 months)
- Villa performance bar charts
- Booking sources pie chart
- Top performing villas table
- Interactive charts with Recharts

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🌐 API Integration

The app connects to the backend API using RTK Query. All API endpoints are defined in `src/services/api/`:

### Villa Endpoints
- `GET /villas/` - List all villas
- `GET /villas/:id/` - Get villa details
- `POST /villas/` - Create villa
- `PUT /villas/:id/` - Update villa
- `DELETE /villas/:id/` - Delete villa
- `GET /villas/:id/availability/` - Check availability

### Booking Endpoints
- `GET /bookings/` - List all bookings
- `GET /bookings/:id/` - Get booking details
- `POST /bookings/` - Create booking
- `PUT /bookings/:id/` - Update booking
- `DELETE /bookings/:id/` - Delete booking
- `GET /bookings/calendar/` - Calendar view
- `GET /bookings/dashboard-overview/` - Dashboard stats
- `GET /bookings/recent-bookings/` - Recent bookings
- `GET /bookings/revenue-chart/` - Revenue data
- `GET /bookings/villa-performance/` - Performance metrics
- `GET /bookings/booking-sources/` - Source breakdown

## 🎯 Usage

### Login

1. Navigate to `/login`
2. Enter any email and password (demo mode)
3. Click "Sign In"
4. Redirected to dashboard

### Managing Villas

1. Go to "Villas" page
2. Click "Add Villa" to create new
3. View villa cards with details
4. Filter by status
5. Delete villas as needed

### Managing Bookings

1. Go to "Bookings" page
2. Click "New Booking" to create
3. Search and filter bookings
4. View comprehensive table
5. Delete bookings

### Viewing Analytics

1. Go to "Analytics" page
2. View revenue trends
3. Check villa performance
4. Analyze booking sources
5. Review top performers

## 📱 Mobile Responsiveness

- Mobile-first design approach
- Collapsible sidebar on mobile
- Responsive tables with horizontal scroll
- Touch-friendly buttons and inputs
- Optimized charts for small screens

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color palette:

```js
colors: {
  primary: { ... },
  secondary: { ... },
}
```

### Components

All reusable components are in `src/components/common/`:
- Button
- Card
- Badge
- LoadingSpinner
- StatCard

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel/Netlify

1. Connect your Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy!

## 🐛 Troubleshooting

### API Connection Issues

- Check `.env` file has correct API URL
- Verify backend is running
- Check browser console for errors
- Ensure CORS is configured on backend

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf dist`
- Update dependencies: `npm update`

## 📄 License

MIT License

## 👥 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using React, Redux Toolkit, and Tailwind CSS**
