import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCommentDto {
    @ApiProperty()
    @IsString()
    @MinLength(5)
    text: string;
}
