import os
from dotenv import load_dotenv
load_dotenv()
JWT_KEY=os.getenv("JWT_SECRET")
