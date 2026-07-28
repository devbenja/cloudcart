import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    constructor(private readonly config: ConfigService) {}

    onModuleInit() {
        this.client = new Redis({
            host: this.config.get<string>("REDIS_HOST"),
            port: this.config.get<number>("REDIS_PORT"),
        });
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

    getClient(): Redis {
        return this.client;
    }

    async ping(): Promise<string> {
        return this.client.ping();
    }
}
