import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Public } from "../../auth/decorators/public.decorator";

@ApiTags("health")
@Controller("health")
@Public()
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
