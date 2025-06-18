import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordGameDto {
    @ApiProperty()
    @IsString()
    mode: string;

    @ApiProperty()
    @IsNumber()
    score: number;

    @ApiProperty()
    @IsNumber()
    total: number;
}