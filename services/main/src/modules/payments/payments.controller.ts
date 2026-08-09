import {
    Controller,
    Post,
    Body,
    Req,
    HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './application/payments.service';
import { CreateCheckoutSessionDto } from './application/dto/create-checkout-session.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post('checkout-session')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear una Checkout Session de Stripe para una orden' })
    @ApiResponse({ status: 201, description: 'URL de Stripe para redirigir al pago' })
    @ApiResponse({ status: 400, description: 'La orden no está pendiente de pago' })
    createCheckoutSession(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreateCheckoutSessionDto,
    ) {
        return this.paymentsService.createCheckoutSession(
            user.id,
            dto.orderId,
            user.email ?? undefined,
        );
    }

    @Post('webhook')
    @Public()
    @HttpCode(200)
    @ApiOperation({ summary: 'Webhook de Stripe (eventos de checkout)' })
    @ApiResponse({ status: 200, description: 'Evento recibido' })
    async webhook(@Req() req: any) {
        const payload = (req.rawBody as Buffer) ?? JSON.stringify(req.body);
        const signature = req.headers['stripe-signature'] as string;
        return this.paymentsService.handleWebhook(payload, signature);
    }
}
