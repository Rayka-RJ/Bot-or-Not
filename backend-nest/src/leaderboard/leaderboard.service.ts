import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { GameRecord, GameRecordDocument } from '../game/schemas/game-record.schema';

@Injectable()
export class LeaderboardService {
    constructor(
        @InjectModel(GameRecord.name)
        private gameRecordModel: Model<GameRecordDocument>,
        private jwtService: JwtService,
    ) { }

    async getLeaderboard(token?: string) {
        const modes = ['text', 'image', 'T/F'];
        const results = {};

        for (const mode of modes) {
            const topPerUser = await this.gameRecordModel
                .aggregate([
                    { $match: { mode } },
                    { $sort: { score: -1, createdAt: 1 } },
                    {
                        $group: {
                            _id: '$username',
                            username: { $first: '$username' },
                            score: { $first: '$score' },
                            total: { $first: '$total' },
                        },
                    },
                    { $sort: { score: -1 } },
                    { $limit: 10 },
                ])
                .exec();

            results[mode] = topPerUser;
        }

        const myBest = {};
        if (token) {
            try {
                const decoded = this.jwtService.verify(token);
                const username = decoded.username;

                for (const mode of modes) {
                    const best = await this.gameRecordModel
                        .findOne({ username, mode })
                        .sort({ score: -1 })
                        .exec();
                    if (best) {
                        myBest[mode] = best;
                    }
                }
            } catch (error) {
                // Invalid token, ignore
            }
        }

        return { top10ByMode: results, myBest };
    }
}