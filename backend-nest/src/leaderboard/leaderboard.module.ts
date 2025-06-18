import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { GameRecord, GameRecordSchema } from '../game/schemas/game-record.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: GameRecord.name, schema: GameRecordSchema },
        ]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET', 'it5007secret'),
                signOptions: { expiresIn: '2h' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [LeaderboardController],
    providers: [LeaderboardService],
})
export class LeaderboardModule { }