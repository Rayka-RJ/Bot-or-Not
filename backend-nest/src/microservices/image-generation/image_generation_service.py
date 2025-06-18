from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Image Generation Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DeepAI API configuration
DEEPAI_API_KEY = os.getenv("DEEPAI_API_KEY", "")
DEEPAI_API_URL = "https://api.deepai.org/api/text2img"


class ImageGenerationRequest(BaseModel):
    description: str


@app.get("/")
async def root():
    return {"message": "Image Generation Service is running"}


@app.post("/generate-image")
async def generate_image(request: ImageGenerationRequest):
    """Generate an image from text description using DeepAI"""
    try:
        if not DEEPAI_API_KEY:
            raise HTTPException(
                status_code=500, 
                detail="DeepAI API key not configured"
            )
        
        response = requests.post(
            DEEPAI_API_URL,
            data={'text': request.description},
            headers={'api-key': DEEPAI_API_KEY}
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"DeepAI API error: {response.text}"
            )
        
        result = response.json()
        
        if 'output_url' not in result:
            raise HTTPException(
                status_code=500,
                detail="Invalid response from DeepAI API"
            )
        
        return {"image_url": result['output_url']}
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect to DeepAI API: {str(e)}"
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)