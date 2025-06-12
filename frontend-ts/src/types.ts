// types.ts 全局定义

// 通用选项类型（用于选择题）
export interface Option {
  text: string;
  source: string; // 可以是 'ai' 或 'human'
}

// 多选题结构（GamePage）
export interface MultiChoiceQuestion {
  prompt: string;
  options: Option[];
  correctAnswer: string; // source 对应值
}

// 图片题结构（ImageTFGame）
export interface ImageQuestion {
  imageUrl: string;
  description: string;
  correctAnswer: 'ai' | 'human';
}

// 新闻判断题结构（TFGame）
export interface TFQuestion {
  prompt: string; // 包含 title + content，需 parse
  correctAnswer: 'True' | 'False';
}

// 排行榜记录结构
export interface Score {
  username: string;
  score: number;
  total: number;
}