const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)

const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize('sqlite:chats.sqlite')

class Chat extends Model {}
class User extends Model {}
Chat.init({
    chat: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
}, { sequelize })

User.init({
    username: DataTypes.STRING,
    status: DataTypes.BOOLEAN
}, { sequelize })

Chat.belongsTo(User)
User.hasMany(Chat)

app.use(express.json())
app.use(express.static('public'))

app.get('/chats', async (req, res) => {
    const chats = await Chat.findAll({include: {model: User, required:true}})
    res.send(chats)
})

app.post('/chats', async (req, res) => {
    const user = await User.findByPk(req.body.UserId)
    const chat = await Chat.create(req.body)
    await user.addChat(chat)
    res.send(chat)
})

app.ws('/chats', (ws, req) => {
    ws.on('message', async _msg => {
        const msg = JSON.parse(_msg)
        console.log(msg)
        const user = await User.findByPk(msg.UserId)
        const chat = await Chat.create(msg)
        await user.addChat(chat)
        expressWs.getWss().clients.forEach(client => {
            client.send(JSON.stringify(chat))
        })
    })
})

app.post('/users', async (req, res) => {
    const previousUser = await User.findByPk(req.body.userID)
    if(previousUser){
        previousUser.update({username: req.body.username})
        res.send(previousUser)
    }else{
        const user = await User.create(req.body)
        res.send(user)
    }
    
})

app.get('/users', async (req, res) => {
    const users = await User.findAll()
    res.send(users)
})

app.listen(3000, async () => {
    await sequelize.sync()
    console.log('ready for chats...')
})