import { MongooseModuleOptions } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";

export const buildMongooseConfig = (
    config: ConfigService,
): MongooseModuleOptions => ({
    uri: config.get<string>("MONGODB_URI"),
});
