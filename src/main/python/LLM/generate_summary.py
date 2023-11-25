import asyncio
import types
from typing import AsyncIterable, Awaitable, Any, AsyncGenerator
import logging

from langchain.llms import LlamaCpp
from langchain.callbacks import StdOutCallbackHandler
from langchain.chains.summarize import load_summarize_chain
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GenerateSummary")

class GenerateSummary:
    """Perform all LLM operations"""
    def __init__(self, model_path:str):
        n_gpu_layers = 10  # Change this value based on your model and your GPU VRAM pool.
        n_batch = 1024  # Should be between 1 and n_ctx, consider the amount of VRAM in your GPU.
        # self.callback = AsyncIteratorCallbackHandler() # Callbacks support token-wise streaming

        # Loading model,
        self.llm = LlamaCpp(
            model_path=model_path,
            max_tokens=1024,
            n_gpu_layers=n_gpu_layers,
            n_batch=n_batch,
            callbacks=[StdOutCallbackHandler()],
            verbose=True,
            streaming=True,
            f16_kv=True,
            n_ctx=4096, # Context window
        )
    async def summarize(self, content: str)-> AsyncGenerator[str, None]:
        """
        Generate a detailed summary
        """
        docs = [Document(page_content=content, metadata={"source": "jquery"})]
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size = 5000,
            chunk_overlap  = 100,
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
        result = chain({"input_documents": split_docs}, return_only_outputs=True)
        return result["output_text"]
