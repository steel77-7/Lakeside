from fastapi.responses import JSONResponse

class ApiResponse(JSONResponse):
    def __init__(self, status_code, data, message):
        content = {"status": status_code, "data": data, "message": message}
        super().__init__(status_code=status_code, content=content)
