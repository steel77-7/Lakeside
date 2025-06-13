import motor.motor_asyncio
import os

client=motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
db = client.lakeside

user_collection = db.get_collection("users")