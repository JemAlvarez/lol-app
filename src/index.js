const express = require('express')
const cors = require('cors')
const championsRouter = require('./routers/championsRouter')
const summonerRouter = require('./routers/summonerRouter')
require('./utils/randomSplashArt')

const app = express()
app.use(cors())
app.use(express.json())
app.use(championsRouter)
app.use(summonerRouter)

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})