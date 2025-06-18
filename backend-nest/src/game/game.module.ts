import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { MicroservicesModule } from '../microservices/microservices.module';
import { Example, ExampleSchema } from './schemas/example.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { RealNews, RealNewsSchema } from './schemas/real-news.schema';
import { Image, ImageSchema } from './schemas/image.schema';
import { GameRecord, GameRecordSchema } from './schemas/game-record.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Example.name, schema: ExampleSchema },
            { name: Question.name, schema: QuestionSchema },
            { name: RealNews.name, schema: RealNewsSchema },
            { name: Image.name, schema: ImageSchema },
            { name: GameRecord.name, schema: GameRecordSchema },
        ]),
        MicroservicesModule,
    ],
    controllers: [GameController],
    providers: [GameService],
})
export class GameModule { }