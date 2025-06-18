import { Controller, Get, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RecordGameDto } from './dto/record-game.dto';

@ApiTags('game')
@Controller('api')
export class GameController {
    constructor(private gameService: GameService) { }

    @Get('generate-multi')
    @ApiOperation({ summary: 'Generate multiple choice questions' })
    async generateMultiChoice(
        @Headers('x-openai-key') apiKey?: string,
        @Headers('x-ai-mode') aiMode?: string,
    ) {
        return this.gameService.generateMultipleChoice(apiKey);
    }

    @Get('generate-tf')
    @ApiOperation({ summary: 'Generate true/false news questions' })
    async generateTrueFalse(
        @Headers('x-openai-key') apiKey?: string,
        @Headers('x-ai-mode') aiMode?: string,
    ) {
        return this.gameService.generateTrueFalse(apiKey);
    }

    @Get('generate-image-tf')
    @ApiOperation({ summary: 'Generate image true/false questions' })
    async generateImageTrueFalse() {
        return this.gameService.generateImageTrueFalse();
    }

    @Post('record')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Record game results' })
    async recordGame(
        @Body() recordDto: RecordGameDto,
        @CurrentUser() user: any,
    ) {
        return this.gameService.recordGame(user.username, recordDto);
    }
}
