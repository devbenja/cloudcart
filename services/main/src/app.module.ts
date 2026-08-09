import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { HealthModule } from "./modules/health/health.module";
import { UsersModule } from "./modules/users/users.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { CartModule } from "./modules/cart/cart.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { KafkaModule } from "./infrastructure/kafka/kafka.module";
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
        KafkaModule,
        HealthModule,
        UsersModule,
        CatalogModule,
        CartModule,
        OrdersModule,
        ReviewsModule,
        AuthModule,
    ],
})

export class AppModule {}
