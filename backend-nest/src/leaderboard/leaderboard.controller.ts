import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@Controller('api')
export class LeaderboardController {
    constructor(private leaderboardService: LeaderboardService) { }

    @Get('leaderboard')
    @ApiOperation({ summary: 'Get leaderboard data' })
    async getLeaderboard(@Headers('authorization') authHeader?: string) {
        const token = authHeader?.split(' ')[1];
        return this.leaderboardService.getLeaderboard(token);
    }
}