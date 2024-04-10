import asyncio

from typing import AsyncGenerator
import logging

from langchain.chains.summarize import load_summarize_chain
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GenerateSummary")

class GenerateSummary:
    """Perform all LLM operations"""
    def __init__(self, llm):
        self.llm = llm
    async def summarize(self, content: str)-> AsyncGenerator[str, None]:
        """
        Generate a detailed summary
        """
        docs = [Document(page_content=content, metadata={"source": "chrome"})]
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size = 2000,
            chunk_overlap  = 250,
            length_function = len,
            is_separator_regex = False,
        )
        split_docs = text_splitter.split_documents(docs)
        logger.info("Generating")
        chain = load_summarize_chain(self.llm, chain_type="map_reduce", verbose=True)

        # Begin a task that runs in the background.
        task = asyncio.create_task(chain.stream(split_docs,return_only_outputs=True))
        try:
            async for token in self.callback.aiter():
                yield token
        except Exception as e:
            print(f"Caught exception: {e}")
        finally:
            self.callback.done.set()
        await task

    def summarize_text(self, content: str):
        startTime = datetime.now()
        logger.info(f'start time {startTime}')
        docs = [Document(page_content=content, metadata={"source": "jquery"})]
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size = 5000,
            chunk_overlap  = 100,
            length_function = len,
            is_separator_regex = False,
        )
        split_docs = text_splitter.split_documents(docs)
        logger.info("Generating Summary")
        chain = load_summarize_chain(self.llm, chain_type="map_reduce", verbose=True)

        # Prompt to identify key themes and summary for each chunk
        chain.llm_chain.prompt.template = """
        Identify the key themes present in the text and generate a concise summarized version of the text, 
        removing irrelevant information. No yapping!
        
        {text}
        
        Return your answer in the following format:
        {{
            "themes": ["Theme 1", "Theme 2", "Theme 3"],
            "summary": "Summary of the text"
        }}
        THEMES AND CONCISE SUMMARY:"""

        result = chain({"input_documents": split_docs}, return_only_outputs=True)
        endTime = datetime.now()
        logger.info(f'time taken {endTime - startTime}')
        response = {"llm_output": result["output_text"], "time_taken": endTime - startTime}
        return response
