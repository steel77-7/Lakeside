from fastapi import FastAPI ,WebSocket, pydantic
from typing import Dict ,List
import json 
import uuid
app = FastAPI() 



    
       
       
            
class Room:
    rooms : Dict[str , List[WebSocket]]
    

class RoomManager : 
    # make the dict
    def __init__(self): 
      self.rooms :Dict[str , List[WebSocket]] = {} 
  
    def Connect(self, soc,room_id): 
        
        if room_id not in self.rooms: 
         self.rooms[room_id] = [] 
        self.rooms[room_id].append(soc); 
        

    def broadcast(self ,room_id,message):
        room = self.rooms[room_id]
        for soc in room : 
            soc.send_message(message)
    
    def messageHandler(self, message: dict,room_id):
        message_type = message.get('type')
        if message_type == 'offer': 
            self.broadcast(room_id,message.get('sdp'))
        elif message_type == 'answer' : 
            self.broadcast(room_id,message.get('sdp'))
        elif message_type == 'sdp': 
            self.broadcast(room_id,message.get('sdp'))
        elif message_type == 'leave-room': 
            self.leaveRoom(room_id,message.get('soc'))
           
    def leaveRoom(self, room_id,leaving_socket):
        #for key in self.rooms:
        if room_id in self.rooms: 
            self.rooms[room_id].remove(soc)
            if self.rooms[room_id].count() == 0:
                del self.rooms[room_id]
                
    

            
Manager = RoomManager()


@app.websocket('/ws')
async def soc(websoc ):
    await  websoc.accept()
    while(True):
        res= websoc.recieve_text()
        if res ==None: 
            print('messaeg is empty')
            continue
        res_json = json.loads(res)
        Manager.Connect(websoc, res_json['room_id'])