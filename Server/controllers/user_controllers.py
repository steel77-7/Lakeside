from fastapi import Request
from models import User
from lib.db import user_collection
from pymongo.errors import DuplicateKeyError
from fastapi import HTTPException
import bcrypt
from lib.models import LoginRequest
from lib.api_response import ApiResponse
import json
import jwt
from lib.constants import JWT_KEY
import time, datetime
from datetime import timezone

async def register(request:Request):
    try:
        data = await request.json()
        user=User(**data)
        user_dict=user.model_dump(by_alias=True)
        hashed = bcrypt.hashpw(user_dict['password'].encode('utf-8'), bcrypt.gensalt())
        user_dict['username']=user_dict['username'].lower()
        user_dict["password"]=hashed.decode('utf-8')
        result = await user_collection.insert_one(user_dict)
        id = result.inserted_id 

        return ApiResponse(200, {"username":user_dict["username"],"email":user_dict["email"],"id":str(id)}, "User Registered Successfully")
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Username already exists")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server Error")

async def login(request:LoginRequest):
        data = request.model_dump_json()
        data=json.loads(data)
        email = data['email'].lower()
        password=data['password']

        user = await user_collection.find_one({"email":email})
        if not user:
            raise HTTPException(status_code=404,detail="User not found")
        
        payload = {
            "exp": datetime.datetime.now(tz=timezone.utc) + datetime.timedelta(hours=6),
            "id": str(user["_id"])
        }

        encoded = jwt.encode(payload, JWT_KEY, algorithm="HS256")
        # jwt.decode(encoded, key, algorithms="HS256")

        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        else:
            return ApiResponse(200, {"username":user["username"],"email":user["email"],"id": str(user["_id"]),"token":encoded}, "Login Succeed")

async def get_user_by_token(payload):
    return ApiResponse(200, payload, "User Fetched")