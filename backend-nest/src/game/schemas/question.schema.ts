import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
    @Prop({ required: true })
    mode: string;

    @Prop({ required: true })
    prompt: string;

    @Prop({ required: true })
    humanAnswer: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);