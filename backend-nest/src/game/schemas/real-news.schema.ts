import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RealNewsDocument = RealNews & Document;

@Schema({ timestamps: true })
export class RealNews {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    content: string;

    @Prop({ default: 'real' })
    label: string;
}

export const RealNewsSchema = SchemaFactory.createForClass(RealNews);