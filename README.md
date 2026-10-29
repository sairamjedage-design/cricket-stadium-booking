# 3D Cricket Stadium Seat Visualization and Ticket Booking System

A full-stack web application for booking cricket match tickets with an immersive 3D stadium experience.

## Features

- 🏟️ Interactive 3D cricket stadium with realistic seat visualization
- 🎯 Individual seat selection with real-time availability
- 👁️ "View from Seat" feature to see the pitch perspective from any seat
- 📱 Responsive design for mobile and desktop
- 🔐 User authentication with JWT
- 💳 Secure booking system with payment processing
- 📧 Email confirmation and QR code ticket generation
- 👨‍💼 Admin dashboard for managing stadiums, matches, and bookings
- 💰 Dynamic pricing based on seat categories
- 🔄 Prevents double booking with database transactions

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite
- React Three Fiber + Three.js for 3D rendering
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- Framer Motion for animations
- Lucide React for icons

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL database
- JWT for authentication
- bcrypt for password hashing

## Project Structure
```
cricket-stadium-booking/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── store/            # Zustand stores
│   │   ├── styles/           # CSS and Tailwind configuration
│   │   └── App.tsx           # Main application component
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Custom middleware
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utility functions
│   │   └── server.ts         # Express server entry point
│   ├── prisma/               # Prisma ORM configuration
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Database seeding script
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── docker-compose.yml        # Docker configuration (optional)
├── README.md                 # This file
└── .env.example              # Environment variables template
```

## Database Schema

The system uses a relational database with the following main entities:

- **User**: Registered users of the system
- **Stadium**: Cricket stadiums with name, location, and capacity
- **Section**: Seating sections within a stadium (General, Premium, VIP, Corporate)
- **Seat**: Individual seats with row/seat numbers, status, and pricing
- **Match**: Cricket matches between teams at a specific stadium
- **Booking**: Completed bookings with user, match, and payment information
- **BookingSeat**: Junction table linking bookings to seats with pricing at time of booking

## Installation and Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL database
- npm or yarn package manager

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database connection string and JWT secret:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/cricket_stadium_booking?schema=public"
   JWT_SECRET="your_secure_jwt_secret"
   PORT=5000
   ```

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

6. Create/update the database tables from the Prisma schema:
   ```bash
   npx prisma db push
   ```

7. Seed the database with sample data:
   ```bash
   npm run prisma:seed
   ```

8. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

Create an account to save your profile and bookings in PostgreSQL. Guest access is for exploring only.

## Public deployment (Railway)

The project has three services: a PostgreSQL database, the API, and the frontend. Deploy the repository to Railway, then configure each service:

1. Create a Railway project from the repository and add a PostgreSQL service.
2. Add a backend service with root directory `/backend`:
   - Build command: `npm run prisma:generate && npm run build`
   - Start command: `npm start`
   - Healthcheck path: `/api/health`
   - Variables: `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `JWT_SECRET` (a new random secret of at least 32 characters), and `FRONTEND_URL` (the frontend's public HTTPS origin).
3. Generate a public domain for the backend. From the backend service root, run `railway run npm run db:setup` once to create the Prisma tables and seed the sample fixtures.
4. Add a frontend service with root directory `/frontend`:
   - Build command: `npm run build`
   - Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`
   - Build variable: `VITE_API_URL=https://<backend-public-domain>/api`
5. Generate a public domain for the frontend and set `FRONTEND_URL` on the backend to that exact HTTPS origin. Redeploy both services after setting these values.

The shareable app URL is the frontend domain Railway generates. Keep database credentials and `JWT_SECRET` in Railway's service variables; never commit them to the repository.

## Available API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and receive JWT token

### Matches
- `GET /api/matches` - Get all upcoming matches
- `GET /api/matches/:id` - Get a specific match by ID

### Stadiums & Sections
- `GET /api/stadiums` - Get all stadiums
- `GET /api/stadiums/:id` - Get a specific stadium by ID
- `GET /api/stadiums/:id/sections` - Get sections for a specific stadium

### Seats
- `GET /api/matches/:matchId/seats` - Get all seats for a match with availability status

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/:id` - Get a specific booking by ID

## Features in Detail

### 3D Stadium Visualization
- Built with React Three Fiber and Three.js
- Interactive camera controls (orbit, zoom, pan)
- Procedurally generated seats for optimal performance
- Real-time seat status visualization (available, selected, booked, blocked)
- Hover tooltips showing seat information

### View from Seat Feature
- When a seat is selected, users can click "View from Seat"
- Camera moves to spectator eye level behind the selected seat
- Camera points toward the cricket pitch for realistic view
- Smooth camera transitions between views
- "Back to Stadium" button returns to overview

### Booking Flow
1. Select a match from the list
2. View the 3D stadium and available seats
3. Hover over seats to see details (section, row, price)
4. Click seats to select/deselect them
5. View selected seats and total price in the booking panel
6. Click "Continue to Booking" to enter customer information
7. Submit the form to create the booking
8. Receive booking confirmation with QR code ticket

### Admin Dashboard
- View system statistics (total bookings, revenue, etc.)
- Manage stadiums, sections, and seats
- Schedule new matches
- View and manage bookings
- Basic analytics and reporting

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/cricket_stadium_booking?schema=public"
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env.example)
```
VITE_API_URL=http://localhost:5000
```

## Development Commands

### Backend
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed

# Start development server
npm run dev

# Start production server
npm start
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Design Decisions

### 3D Implementation
- Used React Three Fiber for easier integration with React
- Implemented instanced rendering concepts for performance (though current implementation uses individual meshes for simplicity)
- Added proper lighting and materials for realistic stadium appearance
- Implemented frustum culling concepts for optimization

### State Management
- Used Zustand for lightweight, scalable state management
- Separated concerns with different stores for auth and stadium/booking state
- Persisted authentication state in localStorage

### Performance Considerations
- Debounced rapid seat selection events
- Optimized re-renders with React.memo where appropriate
- Used efficient data structures for seat lookup
- Implemented proper cleanup of event listeners

### Security
- JWT-based authentication with HTTP-only cookies in production
- Password hashing with bcrypt
- Input validation and sanitization
- Protection against common web vulnerabilities
- Database transactions to prevent race conditions in booking

## Future Enhancements

1. **Payment Integration**: Add real payment gateway integration (Stripe, PayPal, etc.)
2. **Email Service**: Implement actual email sending for booking confirmations
3. **Advanced Analytics**: Add more detailed analytics in admin dashboard
4. **Mobile Optimizations**: Further optimize 3D performance on mobile devices
5. **Accessibility Improvements**: Add ARIA labels and keyboard navigation
6. **Multi-language Support**: Add internationalization for global audience
7. **Seat Recommendation Engine**: Implement AI-based seat suggestions
8. **Social Sharing**: Allow users to share their bookings on social media
9. **Corporate Booking**: Add group booking functionality for corporate clients
10. **Loyalty Program**: Implement rewards and loyalty points system

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by various sports ticketing platforms
- Built with modern web technologies
- Thanks to the open-source community for the amazing libraries used
- Special thanks to Cricket fans everywhere! 🏏