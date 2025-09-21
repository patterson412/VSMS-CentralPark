import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add health check route
  app.getHttpAdapter().get('/health', (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.NODE_ENV === "production" ? [process.env.FRONTEND_URL || "*"] : true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle("Vehicle Sales Management API")
    .setDescription(
      "API for managing vehicle inventory with AI-powered descriptions",
    )
    .setVersion("1.0")
    .addTag("auth", "Authentication endpoints")
    .addTag("vehicles", "Vehicle management endpoints")
    .addTag("admin", "Admin-only endpoints")
    .addTag("aws", "File upload endpoints")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      "JWT-auth",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Vehicle Sales Management API running on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api`);
}

bootstrap();
