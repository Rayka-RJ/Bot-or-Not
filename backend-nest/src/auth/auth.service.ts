import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { username, password } = registerDto;

        const existingUser = await this.userModel.findOne({ username });
        if (existingUser) {
            throw new BadRequestException('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userModel.create({ username, password: hashedPassword });

        // 注册成功后自动登录，返回token
        return this.login(user);
    }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userModel.findOne({ username });
        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        return { username: user.username, _id: user._id };
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user._id };
        return {
            token: this.jwtService.sign(payload),
            message: 'Login success',
        };
    }
}