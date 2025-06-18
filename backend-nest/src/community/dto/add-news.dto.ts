import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddNewsDto {
    @ApiProperty()
    @IsString()
    @MinLength(10)
    news: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    comment: string;
}