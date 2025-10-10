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
## Chat

patterson412: In the findAll method we should be able to also sort by featured vehicles. There is a boolean in each vehicle indicating is it featured or not. The featured vehicles need to be on top of the returned array of vehicles

GitHub Copilot: To support sorting by featured vehicles (i.e., featured vehicles appear at the top), you can modify the `findAll` method to add a secondary sort by the `featured` boolean. In SQL, `ORDER BY featured DESC` will put `true` (or 1) values first.

Update the sorting logic in your `findAll` method as follows:

````typescript
// ...existing code...
    // Apply sorting
    const sortBy = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder || "DESC";

    const validSortFields = ["price", "year", "createdAt", "brand", "model", "featured"];
    if (sortBy === "featured") {
      // Always sort featured vehicles first, then by createdAt DESC (or another secondary sort)
      queryBuilder.orderBy("vehicle.featured", "DESC")
                  .addOrderBy("vehicle.createdAt", "DESC");
    } else if (validSortFields.includes(sortBy)) {
      // If not sorting by featured, still sort featured vehicles first by default
      queryBuilder.orderBy("vehicle.featured", "DESC")
                  .addOrderBy(`vehicle.${sortBy}`, sortOrder);
    } else {
      // Default sort: featured first, then createdAt DESC
      queryBuilder.orderBy("vehicle.featured", "DESC")
                  .addOrderBy("vehicle.createdAt", "DESC");
    }
// ...existing code...
````

This ensures that featured vehicles are always at the top, regardless of the other sort fields, and allows explicit sorting by "featured" if requested.

patterson412: does this modify the existing sorting functionality differently ?

GitHub Copilot: Yes, this does modify the existing sorting functionality.

**How it changes the sorting:**

- **Previously:** Sorting was only by the requested field (e.g., price, year, createdAt, etc.), with no guarantee that featured vehicles would appear at the top.
- **Now:** Regardless of the requested sort field, featured vehicles (`vehicle.featured = true`) will always appear at the top of the results. The secondary sort (e.g., by price, year, etc.) will only apply within the featured and non-featured groups.

**Example:**
- If you sort by price ascending, you will get all featured vehicles sorted by price, then all non-featured vehicles sorted by price.
- If you sort by createdAt descending, you will get all featured vehicles sorted by createdAt, then all non-featured vehicles sorted by createdAt.

**Summary:**  
The new logic always prioritizes featured vehicles at the top, then applies the requested sort order within those groups. This is different from standard sorting, where featured status would not affect the order unless explicitly requested.

patterson412: currently the default sorts by featured but the createdAt is not changable ?, we need for the default to be able to sort by featured and then the createdAt as well

GitHub Copilot: You're correct: in your current code, the default always sorts by `featured` first and then by `createdAt DESC`, but if the user wants to sort by `createdAt ASC`, that isn't possible—the secondary sort is always descending.

To allow sorting by `createdAt` in either direction (while still keeping featured vehicles on top), update the sorting logic like this:

````typescript
// ...existing code...
    const sortBy = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder || "DESC";

    const validSortFields = ["price", "year", "createdAt", "brand", "model", "featured"];
    if (sortBy === "featured") {
      // Sort by featured, then createdAt DESC (default secondary)
      queryBuilder.orderBy("vehicle.featured", "DESC")
                  .addOrderBy("vehicle.createdAt", "DESC");
    } else if (validSortFields.includes(sortBy)) {
      // Always sort featured first, then by the requested field and order
      queryBuilder.orderBy("vehicle.featured", "DESC")
                  .addOrderBy(`vehicle.${sortBy}`, sortOrder);
    } else {
      // Default: featured first, then createdAt DESC
      queryBuilder.orderBy("vehicle.featured", "DESC")
                  .addOrderBy("vehicle.createdAt", "DESC");
    }
// ...existing code...
````

Now, if the user requests `sortBy=createdAt&sortOrder=ASC`, the vehicles will be sorted by featured first, then by `createdAt ASC`. This applies to any valid sort field and order.

patterson412: the Current implementation handles this well, we need to makesure there is a default value for the vehicle entity featured attribute where 'False' should be the default. and the sorting query also should use the default value

GitHub Copilot: To ensure the `featured` attribute in your `Vehicle` entity defaults to `false` and is always present in the database, you should:

1. Add the `@Column` decorator for `featured` with a default value of `false`.
2. Remove the optional (`?`) from the `featured` property so it's always defined.
3. The sorting query in your service already works as long as the column exists and has a default.

Here’s how to update your entity:

````typescript
// ...existing code...

  @ApiProperty({
    description: 'Whether the vehicle is featured',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  featured: boolean;

// ...existing code...
````

This ensures all new vehicles have `featured` set to `false` by default, and your sorting logic will always work as expected.