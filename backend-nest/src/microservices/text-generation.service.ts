import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { TextResponse, CommentResponse, NewsResponse } from './types';
import { AxiosError } from 'axios';

export interface TextGenerationRequest {
    messages: Array<{
        role: string;
        content: string;
    }>;
    temperature?: number;
    max_tokens?: number;
    api_key?: string;
}

@Injectable()
export class TextGenerationService {
    private readonly serviceUrl: string;

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
    ) {
        this.serviceUrl = this.configService.get<string>(
            'TEXT_GENERATION_SERVICE_URL',
            'http://localhost:8001',
        );
    }

    async generateText(request: TextGenerationRequest): Promise<string> {
        try {
            const response = await firstValueFrom(
                this.httpService.post<TextResponse>(`${this.serviceUrl}/generate-text`, request),
            );
            return response.data.text;
        } catch (error) {
            const axiosError = error as AxiosError;
            throw new HttpException(
                axiosError.response?.data || 'Text generation failed',
                axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async generateMultipleComments(
        newsText: string,
        examples: string[],
        count: number = 3,
        apiKey?: string,
    ): Promise<string[]> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.serviceUrl}/generate-comments`, {
                    news_text: newsText,
                    examples,
                    count,
                    api_key: apiKey,
                }),
            );
            return response.data.comments;
        } catch (error) {
            const axiosError = error as AxiosError;
            throw new HttpException(
                axiosError.response?.data || 'Comment generation failed',
                axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async generateFakeNews(apiKey?: string): Promise<string> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.serviceUrl}/generate-fake-news`, {
                    api_key: apiKey,
                }),
            );
            return response.data.news;
        } catch (error) {
            const axiosError = error as AxiosError;
            throw new HttpException(
                axiosError.response?.data || 'Fake news generation failed',
                axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}