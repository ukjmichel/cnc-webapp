# Backend Server Setup Guide

## Overview
The CNC WebApp now includes a backend API server to support barcode lookup functionality using OpenFoodFacts and UPCItemDB APIs.

## Architecture

### Frontend (Angular/Ionic)
- Port: `8100` (default Ionic dev server)
- Location: `src/app/`

### Backend (Express/TypeScript)
- Port: `3000` (default)
- Location: `server/` and `src/controllers/`, `src/routes/`, `src/services/`

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` to add your UPCItemDB API key (optional - trial API is used by default):
```env
PORT=3000
NODE_ENV=development
UPCITEMDB_API_KEY=your_api_key_here
```

### 3. Start the Backend Server
```bash
npm run server:dev
```

The server will start at `http://localhost:3000`

### 4. Start the Frontend (in a new terminal)
```bash
npm start
```

The frontend will start at `http://localhost:8100`

### 5. Start Both Together (Alternative)
```bash
npm install -g concurrently  # Install concurrently globally if not already
npm run start:all
```

This starts both backend and frontend simultaneously.

## API Endpoints

### Health Check
```
GET http://localhost:3000/health
```

### Barcode Lookup (Combined)
```
GET http://localhost:3000/api/barcode/:code
```
Returns combined data from OpenFoodFacts and UPCItemDB.

Example:
```bash
curl http://localhost:3000/api/barcode/3017620422003
```

### OpenFoodFacts Only
```
GET http://localhost:3000/api/barcode/:code/food
```

### UPCItemDB Only
```
GET http://localhost:3000/api/barcode/:code/retail
```

### Batch Lookup
```
POST http://localhost:3000/api/barcode/batch
Content-Type: application/json

{
  "codes": ["3017620422003", "012345678905"]
}
```

## External APIs Used

### OpenFoodFacts
- **URL**: https://world.openfoodfacts.org
- **API Key**: Not required (open database)
- **Rate Limiting**: Be reasonable, respect their infrastructure
- **Documentation**: https://wiki.openfoodfacts.org/API

### UPCItemDB
- **URL**: https://api.upcitemdb.com
- **API Key**: Optional (trial endpoint available)
- **Rate Limiting**: Trial API has limited requests
- **Documentation**: https://www.upcitemdb.com/api/explorer
- **Get API Key**: https://www.upcitemdb.com/ (for higher limits)

## Project Structure

```
cnc-webapp/
├── server/
│   ├── app.ts          # Express app configuration
│   └── index.ts        # Server entry point
├── src/
│   ├── app/            # Angular frontend
│   ├── controllers/    # Backend controllers
│   │   └── barcode.controller.ts
│   ├── routes/         # Backend routes
│   │   └── barcode.routes.ts
│   ├── services/       # Backend services
│   │   ├── openfoodfacts.service.ts
│   │   └── upcitemdb.service.ts
│   ├── middlewares/    # Backend middleware
│   │   ├── requireAuth.ts
│   │   └── requireRole.ts
│   ├── validators/     # Request validators
│   │   └── barcode.validator.ts
│   └── errors/         # Custom error classes
│       └── index.ts
├── .env.example        # Environment variables template
├── nodemon.json        # Nodemon configuration
└── tsconfig.server.json # TypeScript config for backend
```

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
# Build frontend
npm run build

# Backend runs with ts-node (for production, compile TypeScript first)
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, change it in `.env`:
```env
PORT=3001
```

### CORS Errors
The backend is configured to allow requests from:
- `http://localhost:8100` (Ionic dev server)
- `http://localhost:4200` (Angular dev server)

If you're running on a different port, update `server/app.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:8100', 'http://localhost:4200', 'http://localhost:YOUR_PORT'],
  credentials: true,
}));
```

### Module Resolution Errors
Make sure you're using the correct tsconfig:
```bash
ts-node --esm --project tsconfig.server.json server/index.ts
```

### External API Failures
- **OpenFoodFacts**: The API might be slow or temporarily unavailable. This is normal - the system will fallback gracefully.
- **UPCItemDB**: Trial API has rate limits. Consider getting an API key for higher limits.

## Authentication (TODO)

Currently, the authentication middleware is a pass-through for development purposes. To implement proper authentication:

1. Update `src/middlewares/requireAuth.ts` to validate JWT tokens
2. Update `src/middlewares/requireRole.ts` to check user roles
3. Integrate with your authentication system

## Next Steps

- [ ] Implement proper authentication/authorization
- [ ] Add request caching to reduce external API calls
- [ ] Add request rate limiting
- [ ] Add logging middleware
- [ ] Add request validation for all endpoints
- [ ] Set up production build process for backend
- [ ] Add database integration (if needed)
- [ ] Add unit and integration tests for backend
- [ ] Deploy backend to production server

## Support

For issues related to:
- **Barcode scanning**: See `CAMERA_SCANNING_SETUP.md`
- **Barcode implementation**: See `BARCODE_IMPLEMENTATION.md`
- **Frontend**: Check Angular/Ionic documentation
- **Backend**: Check Express documentation
