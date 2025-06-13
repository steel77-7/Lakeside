from pydantic import BaseModel,Field,EmailStr
from typing import Optional, List
from typing_extensions import Annotated
from pydantic.functional_validators import BeforeValidator
from bson import ObjectId

PyObjectId=Annotated[str,BeforeValidator(str)]

class User(BaseModel):
    """
    User Model definition
    """
    username:str=Field(...)
    email:EmailStr=Field(...)
    password:str=Field(...)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}