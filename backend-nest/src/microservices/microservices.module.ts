import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TextGenerationService } from './text-generation.service';
import { ImageGenerationService } from './image-generation.service';

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [TextGenerationService, ImageGenerationService],
    exports: [TextGenerationService, ImageGenerationService],
})
export class MicroservicesModule { }