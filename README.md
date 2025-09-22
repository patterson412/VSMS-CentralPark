# Vehicle Sales Management System (VSMS)

A full-stack vehicle sales management system with NestJS backend and Next.js frontend.

## Setup Instructions

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd VSMS-CentralPark
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

2. **Configure environment variables:**

   **Quick Setup:**
   ```bash
   chmod +x setupsecrets.sh
   ./setupsecrets.sh
   ```
   Then update `backend/.env` with your AWS credentials and API keys.

   *Note: Windows users may need Git Bash or can manually replace the generated placeholder secrets.*

3. **Run the application:**
```bash
docker-compose up
```

4. **Seed the database:**
```bash
# Wait for backend to start, then seed data
docker-compose exec backend npm run seed:all

# For production database (requires DATABASE_URL env var in the backend):
# NODE_ENV=production npm run seed:all
```

Local Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api

**Default Admin Credentials after seeding:**
- Username: `admin`
- Password: `admin`

## Features Implemented

- **Authentication**: JWT-based auth with NextAuth.js v5
- **Vehicle Management**: CRUD operations for vehicle inventory
- **File Upload**: AWS S3 integration with CloudFront CDN
- **AI Integration**: OpenAI API for vehicle descriptions
- **Database**: MySQL (dev) / PostgreSQL (prod) with TypeORM
- **API Documentation**: Swagger/OpenAPI specs and JSDoc
- **API Rate-Limiting**: Done using NestJS Throttler, especially to minimize cost's when misuse of AI features occurs

## Assumptions/Limitations

- Requires AWS S3 bucket for file uploads
- OpenAI API key needed for AI features
- Database seeding creates sample vehicles without images since it would add unneccessary overhead to store sample images
- Production uses a PostgreSQL database since Supabase provided free database hosting. while on development a MySQL database is used with Docker
- No user registration flow (admin seeded with script execution)
- User Contact/Inquiry left for future implementations
- /search page is optimized for quick searches with basic filters, while /vehicles page includes additional sorting and price range controls

## Future considerations

- If more role types are required could adjust Admin entity to be a generic User entity which also stores the Role type.
- Database normalisation could be done by taking the Images into a separate entity and creating relationships between images and vehicle entities. As well as One-Many relationship could be implemented from User to Vehicle if future features require it.
- Refresh token mechanism not used here, but if needed can generate and send long-lived token along with accessToken when admin login and in the NextAuth JWT callback could have a condition to check for access token expiry and if so use refresh token to request for a new accessToken from an API endpoint.
- Authentication/Authorization could be moved to an identity framework like Keycloak for more complicated requirements and user management.

## API Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Application health check | No |
| POST | `/auth/login` | Admin login | No |
| GET | `/vehicles` | List vehicles with filtering/search/pagination | No |
| GET | `/vehicles/stats` | Get vehicle statistics | No |
| GET | `/vehicles/:id` | Get vehicle by ID | No |
| POST | `/vehicles` | Create vehicle | Yes |
| PATCH | `/vehicles/:id` | Update vehicle | Yes |
| DELETE | `/vehicles/:id` | Delete vehicle | Yes |
| POST | `/vehicles/:id/generate-description` | Generate AI description | Yes |
| POST | `/vehicles/generate-description-preview` | Preview AI description | Yes |
| DELETE | `/vehicles/bulk/delete` | Bulk delete vehicles | Yes |
| POST | `/aws/upload/:vehicleId` | Upload vehicle images | Yes |
| DELETE | `/aws/image/:key` | Delete image from S3 | Yes |

Full Swagger API documentation available at `/api` when running the backend.

## Testing

Jest unit tests have been implemented for core services. To run tests:

```bash
cd backend
npm run test
```