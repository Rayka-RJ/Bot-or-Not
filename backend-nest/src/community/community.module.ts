import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { Example, ExampleSchema } from '../game/schemas/example.schema';
import { Question, QuestionSchema } from '../game/schemas/question.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Example.name, schema: ExampleSchema },
            { name: Question.name, schema: QuestionSchema },
        ]),
    ],
    controllers: [CommunityController],
    providers: [CommunityService],
})
export class CommunityModule { }