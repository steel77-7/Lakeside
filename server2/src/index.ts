import express from 'express'
import 'dotenv/config'


const app = express();
const PORT=process.env.PORT;

app.get("/health-check",(req,res)=>{
    res.status(200).json({"message":"Server is healthy"})
})

app.listen(PORT,()=>{
    console.log(`Serving on PORT ${PORT}`)
})