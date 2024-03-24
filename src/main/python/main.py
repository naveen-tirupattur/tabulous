"""Main entrypoint for the app."""
import os
import json
import logging
from dotenv import load_dotenv, find_dotenv
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from src.main.python.LLM.generate_summary import GenerateSummary


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Main")

load_dotenv(find_dotenv())
MODEL_NAME = os.environ.get("MODEL_NAME")
PORT = os.environ.get("PORT")

get_summary = GenerateSummary(model_name=MODEL_NAME)
@app.on_event("startup")
async def startup_event():
    logger.info("starting the server on port 9000")

@app.post("/summarize/",response_class=StreamingResponse)
async def summarize(request: Request) -> StreamingResponse:
    logger.info("Summarizing")
    try:
        request = await request.body()
        logger.info(request)
        jsonRequest = json.loads(request)
        # Call GenerateSummary and get detailed summary
        result = get_summary.summarize(jsonRequest["text"])
        return StreamingResponse(result, media_type="text/event-stream")
    except Exception as e:
        return str(e)

@app.post("/summarizeText/")
async def summarizeText(request: Request):
    logger.info("Summarizing text")
    try:
        request = await request.body()
        logger.info(request)
        jsonRequest = json.loads(request)
        # Call GenerateSummary and get detailed summary
        result = get_summary.summarize_text(jsonRequest["text"])
        logger.info(result)
        return result
    except Exception as e:
        return str(e)

@app.post("/testPost")
async def get(request: Request):
    try:
        request = await request.body()
        return Response(content="hello world!")
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
