from lib.constants import JWT_KEY
import jwt
from fastapi import HTTPException,Request
from lib.db import user_collection
from bson import ObjectId

def decode_token(token:str):
    try:
        return jwt.decode(token,JWT_KEY,algorithms="HS256")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def verify_token(request:Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    user = await user_collection.find_one({"_id":ObjectId(str(payload['id']))})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {"username":user["username"],"email":user["email"],"id":str(user["_id"])}