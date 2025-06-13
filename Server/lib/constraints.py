from lib.db import user_collection

async def init_user_indexes():
    await user_collection.create_index("username", unique=True)