import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
    @Get()
    @ApiOperation({ summary: "Health check endpoint" })
    check() {
        return {
            status: "ok",
            service: "cloudcart-main",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
}
