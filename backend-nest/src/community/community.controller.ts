import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { AddCommentDto } from './dto/add-comment.dto';
import { AddNewsDto } from './dto/add-news.dto';

@ApiTags('community')
@Controller('api')
export class CommunityController {
    constructor(private communityService: CommunityService) { }

    @Post('add-comment')
    @ApiOperation({ summary: 'Add a comment to the examples' })
    async addComment(@Body() addCommentDto: AddCommentDto) {
        return this.communityService.addComment(addCommentDto);
    }

    @Post('add-news')
    @ApiOperation({ summary: 'Add news with a comment' })
    async addNews(@Body() addNewsDto: AddNewsDto) {
        return this.communityService.addNews(addNewsDto);
    }
}