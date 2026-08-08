import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { HealthModule } from "./modules/health/health.module";
import { UsersModule } from "./modules/users/users.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { AuthModule } from "./auth/auth.module";
import { RedisModule } from "./infrastructure/database/redis/redis.module";
import { buildTypeOrmConfig } from "./infrastructure/database/postgres/typeorm.config";
import { buildMongooseConfig } from "./infrastructure/database/mongo/mongoose.config";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env"],
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => buildTypeOrmConfig(config),
        }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => buildMongooseConfig(config),
        }),
        RedisModule,
        HealthModule,
        UsersModule,
        CatalogModule,
        AuthModule,
    ],
})

export class AppModule {}
