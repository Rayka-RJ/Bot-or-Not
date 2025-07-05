# DeepSeek API 配置说明

## 概述
本项目已从OpenAI API迁移到DeepSeek API，以提供更好的文本生成服务。

## 获取DeepSeek API密钥
1. 访问 [DeepSeek官网](https://platform.deepseek.com/)
2. 注册并登录账户
3. 在控制台中创建API密钥
4. 复制API密钥

## 环境变量配置

### 开发环境
在项目根目录创建 `.env` 文件：
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### Docker环境
在 `docker-compose-nest.yml` 同级目录创建 `.env` 文件：
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

## 前端设置
1. 启动应用后，点击设置按钮
2. 选择"使用我自己的DeepSeek API密钥"
3. 输入您的DeepSeek API密钥
4. 保存设置

## API模型
- 使用模型：`deepseek-chat`
- 支持的功能：文本生成、评论生成、假新闻生成

## 注意事项
- DeepSeek API密钥请妥善保管，不要提交到版本控制系统
- 建议在生产环境中使用环境变量而不是前端存储
- 如果遇到API限制，请检查您的DeepSeek账户配额 