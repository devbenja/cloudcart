import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

export const buildTypeOrmConfig = (
    config: ConfigService,
): TypeOrmModuleOptions => ({
    type: "postgres",
    host: config.get<string>("POSTGRES_HOST"),
    port: config.get<number>("POSTGRES_PORT"),
    username: config.get<string>("POSTGRES_USER"),
    password: config.get<string>("POSTGRES_PASSWORD"),
    database: config.get<string>("POSTGRES_DB"),
    entities: [__dirname + "/../../../modules/**/entities/*.entity{.ts,.js}"],
    synchronize: true,
    logging:
        config.get<string>("NODE_ENV") === "development"
            ? ["error", "warn"]
            : ["error"],
});
