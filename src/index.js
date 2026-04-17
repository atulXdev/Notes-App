require("dotenv").config()
const connectDB=require("./config/db.js")
connectDB()
const app=require("./app.js")

const PORT=process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log("Server running on 5000")
})