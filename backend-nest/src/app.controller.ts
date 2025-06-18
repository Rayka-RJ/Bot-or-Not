import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Module } from '@nestjs/common';

@ApiTags('health')
@Controller()
export class AppController {
    @Get('health')
    @ApiOperation({ summary: 'Health check endpoint' })
    healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'bot-or-not-backend',
            version: '1.0.0',
        };
    }
}

// And add to module definition:
@Module({
    imports: [
        // ... existing imports
    ],
    controllers: [AppController], // Add this line
    providers: [], // Keep existing providers
})
export class AppModule { }