import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Example, ExampleDocument } from '../game/schemas/example.schema';
import { Question, QuestionDocument } from '../game/schemas/question.schema';
import { AddCommentDto } from './dto/add-comment.dto';
import { AddNewsDto } from './dto/add-news.dto';

@Injectable()
export class CommunityService {
    constructor(
        @InjectModel(Example.name) private exampleModel: Model<ExampleDocument>,
        @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    ) { }

    async addComment(addCommentDto: AddCommentDto) {
        const { text } = addCommentDto;
        if (!text || text.trim().length < 5) {
            throw new BadRequestException('Comment too short or empty.');
        }

        const result = await this.exampleModel.create({
            text: text.trim(),
            createdAt: new Date(),
        });

        return { message: 'Comment added successfully!', id: result._id };
    }

    async addNews(addNewsDto: AddNewsDto) {
        const { news, comment } = addNewsDto;
        if (!news || !comment) {
            throw new BadRequestException('Missing news or comment.');
        }

        await this.questionModel.create({
            mode: 'text',
            prompt: news.trim(),
            humanAnswer: comment.trim(),
            createdAt: new Date(),
        });

        return { message: 'News added successfully!' };
    }
}