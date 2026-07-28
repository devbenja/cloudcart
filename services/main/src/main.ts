import 'reflect-metadata';
import { NestFactory } from "@nestjs/core";
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({ logger: true }),
    );

    const configService = app.get(ConfigService);
    const port = configService.get<number>("PORT") || 3001;
    const corsOrigin =
        configService.get<string>("CORS_ORIGIN") || "http://localhost:3000";

    app.enableCors({ origin: corsOrigin, credentials: true });
    app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix("api/v1");

    const swaggerConfig = new DocumentBuilder()
        .setTitle("CloudCart API")
        .setDescription("CloudCart main service API")
        .setVersion("0.0.1")
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);

    await app.listen(port, "0.0.0.0");

    console.log(`CloudCart API running on http://localhost:${port}`);
    console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
