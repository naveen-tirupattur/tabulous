import logging

from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ProcessText")

class ProcessText:
    def __init__(self, llm):
        self.llm = llm
    def process(self, text):
        return self.llm.tokenize_text(text)

