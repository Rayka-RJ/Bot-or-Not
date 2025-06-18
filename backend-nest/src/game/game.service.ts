import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as he from 'he';
import { TextGenerationService } from '../microservices/text-generation.service';
import { ImageGenerationService } from '../microservices/image-generation.service';
import { Example, ExampleDocument } from './schemas/example.schema';
import { Question, QuestionDocument } from './schemas/question.schema';
import { RealNews, RealNewsDocument } from './schemas/real-news.schema';
import { Image, ImageDocument } from './schemas/image.schema';
import { GameRecord, GameRecordDocument } from './schemas/game-record.schema';
import { RecordGameDto } from './dto/record-game.dto';

@Injectable()
export class GameService {
    constructor(
        @InjectModel(Example.name) private exampleModel: Model<ExampleDocument>,
        @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
        @InjectModel(RealNews.name) private realNewsModel: Model<RealNewsDocument>,
        @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
        @InjectModel(GameRecord.name) private gameRecordModel: Model<GameRecordDocument>,
        private textGenerationService: TextGenerationService,
        private imageGenerationService: ImageGenerationService,
    ) { }

    async generateMultipleChoice(apiKey?: string) {
        const N = 3;
        const randomQuestions = await this.questionModel.aggregate([
            { $sample: { size: N } },
        ]);

        const finalQuestions = [];
        for (const q of randomQuestions) {
            const examples = await this.exampleModel.aggregate([
                { $sample: { size: 10 } },
            ]);
            const examplesText = examples.map((e) => e.text);

            try {
                const aiComments = await this.textGenerationService.generateMultipleComments(
                    q.prompt,
                    examplesText,
                    3,
                    apiKey,
                );

                const aiOptions = aiComments.map((text) => ({
                    text: he.decode(text),
                    source: 'AI',
                }));

                const humanOption = {
                    text: q.humanAnswer,
                    source: 'Human',
                };

                const options = [...aiOptions, humanOption].sort(() => Math.random() - 0.5);

                finalQuestions.push({
                    prompt: q.prompt,
                    options,
                    correctAnswer: 'Human',
                });
            } catch (error) {
                console.error('Error generating comments:', error);
                // Fallback options
                const fallbackOptions = [
                    { text: 'AI could not generate a comment.', source: 'AI' },
                    { text: 'AI could not generate a comment.', source: 'AI' },
                    { text: 'AI could not generate a comment.', source: 'AI' },
                    { text: q.humanAnswer, source: 'Human' },
                ].sort(() => Math.random() - 0.5);

                finalQuestions.push({
                    prompt: q.prompt,
                    options: fallbackOptions,
                    correctAnswer: 'Human',
                });
            }
        }

        return { questions: finalQuestions };
    }

    async generateTrueFalse(apiKey?: string) {
        const totalNews = 10;
        const aiCount = 4 + Math.floor(Math.random() * 3);
        const realCount = totalNews - aiCount;

        const realNews = await this.realNewsModel.aggregate([
            { $sample: { size: realCount } },
        ]);

        const aiNews = [];
        for (let i = 0; i < aiCount; i++) {
            try {
                const generated = await this.textGenerationService.generateFakeNews(apiKey);
                aiNews.push({
                    content: generated,
                    label: 'ai',
                });
            } catch (error) {
                console.error('Error generating fake news:', error);
                aiNews.push({
                    content: 'Title: Error\nContent: Failed to generate fake news.',
                    label: 'ai',
                });
            }
        }

        realNews.forEach((doc) => {
            doc.label = 'real';
        });

        const allNews = [...realNews, ...aiNews].sort(() => Math.random() - 0.5);

        const tfQuestions = allNews.map((item) => {
            let prompt = '';
            if (item.label === 'ai') {
                prompt = item.content;
            } else {
                const title = item.title || 'Untitled';
                const content = item.content || 'No content.';
                prompt = `Title: ${title}\nContent: ${content}`;
            }

            return {
                prompt,
                correctAnswer: item.label === 'real' ? 'True' : 'False',
            };
        });

        return { questions: tfQuestions };
    }

    async generateImageTrueFalse() {
        const totalImages = 5;
        const aiCount = Math.floor(Math.random() * 5) + 1;
        const realCount = totalImages - aiCount;

        const realImages = await this.imageModel.aggregate([
            {
                $match: {
                    imageBase64: { $exists: true, $ne: '' },
                    description: { $exists: true, $ne: '' },
                },
            },
            { $sample: { size: realCount } },
        ]);

        const formattedRealImages = realImages.map((img) => ({
            imageUrl: `data:image/jpeg;base64,${img.imageBase64}`,
            description: img.description || 'A real photo',
            correctAnswer: 'human',
        }));

        const descriptions = await this.imageModel.aggregate([
            { $match: { label: 'hand-drawn', description: { $exists: true, $ne: '' } } },
            { $sample: { size: aiCount * 2 } },
        ]);

        const usedDescriptions = new Set();
        const aiImages = [];

        for (const img of descriptions) {
            if (aiImages.length >= aiCount) break;
            const desc = img.description.trim();
            if (usedDescriptions.has(desc)) continue;

            try {
                const url = await this.imageGenerationService.generateImage(desc);
                if (url) {
                    aiImages.push({
                        imageUrl: url,
                        description: desc,
                        correctAnswer: 'ai',
                    });
                    usedDescriptions.add(desc);
                }
            } catch (error) {
                console.error('Error generating image:', error);
            }
        }

        while (formattedRealImages.length + aiImages.length < totalImages) {
            aiImages.push({
                imageUrl: 'https://via.placeholder.com/512x512?text=Image+Unavailable',
                description: 'Image failed to load. This is a placeholder.',
                correctAnswer: 'ai',
            });
        }

        const allQuestions = [...formattedRealImages, ...aiImages].sort(
            () => Math.random() - 0.5,
        );

        return { questions: allQuestions };
    }

    async recordGame(username: string, recordDto: RecordGameDto) {
        await this.gameRecordModel.create({
            username,
            ...recordDto,
            createdAt: new Date(),
        });
        return { message: 'Record saved' };
    }
}


