import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ImageResponse } from './types';
import { AxiosError } from 'axios';

@Injectable()
export class ImageGenerationService {
    private readonly serviceUrl: string;

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
    ) {
        this.serviceUrl = this.configService.get<string>(
            'IMAGE_GENERATION_SERVICE_URL',
            'http://localhost:8002',
        );
    }

    async generateImage(description: string): Promise<string> {
        try {
            const response = await firstValueFrom(
                this.httpService.post<ImageResponse>(`${this.serviceUrl}/generate-image`, {
                    description,
                }),
            );
            return response.data.image_url;
        } catch (error) {
            const axiosError = error as AxiosError;
            throw new HttpException(
                axiosError.response?.data || 'Image generation failed',
                axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}