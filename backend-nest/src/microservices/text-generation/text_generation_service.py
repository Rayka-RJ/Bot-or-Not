from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Text Generation Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default OpenAI API key from environment
DEFAULT_API_KEY = os.getenv("OPENAI_API_KEY", "")


class Message(BaseModel):
    role: str
    content: str


class TextGenerationRequest(BaseModel):
    messages: List[Message]
    temperature: float = 0.7
    max_tokens: int = 200
    api_key: Optional[str] = None


class CommentGenerationRequest(BaseModel):
    news_text: str
    examples: List[str]
    count: int = 3
    api_key: Optional[str] = None


class FakeNewsRequest(BaseModel):
    api_key: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "Text Generation Service is running"}


@app.post("/generate-text")
async def generate_text(request: TextGenerationRequest):
    """Generate text using OpenAI API"""
    try:
        api_key = request.api_key or DEFAULT_API_KEY
        if not api_key:
            raise HTTPException(status_code=400, detail="No API key provided")
        
        client = openai.OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": m.role, "content": m.content} for m in request.messages],
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        return {"text": response.choices[0].message.content}
    
    except openai.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid API key")
    except openai.RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-comments")
async def generate_comments(request: CommentGenerationRequest):
    """Generate multiple comments based on news and examples"""
    try:
        api_key = request.api_key or DEFAULT_API_KEY
        if not api_key:
            raise HTTPException(status_code=400, detail="No API key provided")
        
        client = openai.OpenAI(api_key=api_key)
        
        examples_text = "\n".join(request.examples)
        
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an excellent comment generation model. After learning from the following sample user comments, "
                    "please generate three comments based on the provided news article. The comments should be natural, fluent, "
                    "you must keep each comment as short as possible (Do not exceed the length of the examples), and do not include quotation marks. "
                    "Each comment must have a distinct style. Return the comments as a numbered list. For example:\nComment 1: ...\nComment 2: ...\nComment 3: ..."
                )
            },
            {
                "role": "user",
                "content": f"Here are some sample user comments:\n{examples_text}\n\nBased on these examples, please generate three comments for the following news article:\n\n{request.news_text}\n\nPlease output the comments as a numbered list (e.g., Comment 1: ...)."
            }
        ]
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7,
            max_tokens=200
        )
        
        generated_text = response.choices[0].message.content
        
        # Parse the generated comments
        lines = generated_text.split('\n')
        comments = []
        
        for line in lines:
            line = line.strip()
            if line and len(line) > 10:
                # Remove "Comment X:" prefix if present
                if line.startswith("Comment") and ":" in line:
                    comment = line.split(":", 1)[1].strip()
                else:
                    comment = line
                comments.append(comment)
        
        # Ensure we have at least 3 comments
        while len(comments) < request.count:
            comments.append("AI could not generate a comment.")
        
        return {"comments": comments[:request.count]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-fake-news")
async def generate_fake_news(request: FakeNewsRequest):
    """Generate realistic-looking fake news"""
    try:
        api_key = request.api_key or DEFAULT_API_KEY
        if not api_key:
            raise HTTPException(status_code=400, detail="No API key provided")
        
        client = openai.OpenAI(api_key=api_key)
        
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an AI model trained to generate educational fake news headlines and summaries for training users "
                    "in distinguishing between real and AI-generated news. The goal is to generate fake news that is **subtle, believable**, "
                    "and written in a **concise, journalistic tone**. DO NOT include obviously absurd content. "
                    "Make it look like something from a newswire: slightly vague, neutral in tone, and lacking hard verifiable facts. "
                    "Each sample includes: Title: [a short news headline] Content: [1-2 sentence summary that sounds like real news, but is actually AI-generated]"
                )
            },
            {
                "role": "user",
                "content": (
                    "Here are some real news examples:\n"
                    "Title: Eurozone economy keeps growing\n"
                    "Content: Official figures show the 12-nation eurozone economy continues to grow, but there are warnings it may slow down later in the year.\n\n"
                    "Title: Expansion slows in Japan\n"
                    "Content: Economic growth in Japan slows down as the country experiences a drop in domestic and corporate spending.\n\n"
                    "Title: Rand falls on shock SA rate cut\n"
                    "Content: Interest rates are trimmed to 7.5 by the South African central bank, but the lack of warning hits the rand and surprises markets.\n\n"
                    "Now, please generate **1 fake but realistic-looking news item** that mimics this format. "
                    "It must follow the same structure and tone as the real samples. Remember, this is for educational/analysis use only."
                )
            }
        ]
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7,
            max_tokens=150
        )
        
        return {"news": response.choices[0].message.content}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)