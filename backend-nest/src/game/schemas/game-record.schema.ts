import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameRecordDocument = GameRecord & Document;

@Schema({ timestamps: true })
export class GameRecord {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    mode: string;

    @Prop({ required: true })
    score: number;

    @Prop({ required: true })
    total: number;
}

export const GameRecordSchema = SchemaFactory.createForClass(GameRecord);
