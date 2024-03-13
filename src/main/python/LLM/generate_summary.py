import asyncio

from typing import AsyncGenerator
import logging

from langchain.chains.summarize import load_summarize_chain
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.llms import Ollama

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GenerateSummary")

class GenerateSummary:
    """Perform all LLM operations"""
    def __init__(self, model_name:str):
        self.llm = Ollama(model=model_name)
    async def summarize(self, content: str)-> AsyncGenerator[str, None]:
        """
        Generate a detailed summary
        """
        docs = [Document(page_content=content, metadata={"source": "chrome"})]
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size = 5000,
            chunk_overlap  = 100,
            length_function = len,
            is_separator_regex = False,
        )
        split_docs = text_splitter.split_documents(docs)
        print(split_docs)
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
        # chain.llm_chain.prompt.template = \
        #     """Write a two-paragraph summary the following and highlight key themes:
        #
        #
        #     "{text}"
        #
        #
        #     2 PARAGRAPH SUMMARY:"""
        result = chain({"input_documents": split_docs}, return_only_outputs=True)
        return result["output_text"]
