const ws = new WebSocket('ws://localhost:3000/chats')
const chatForm = document.getElementById('chat')
const otherChats = document.getElementById('chats')
const userForm = document.getElementById('user')
const userMain = document.getElementById('userName')
const main = document.getElementById('main')

chatForm.addEventListener('submit', function (event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const chat = formData.get('chat')
    const user = JSON.parse(localStorage.getItem("user"))
    const body = JSON.stringify({chat, status: 0,UserId: user.id})
    fetch('/chats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(res => res.json())
    .then(chat => {
        event.target.reset()
    })
    ws.send(body)
    event.target.reset()
    //newv.scrollIntoView(false)
})

ws.addEventListener('message', chat => {
    const el = document.createElement('li')
    const chatData = JSON.parse(chat.data)
    el.innerHTML = chatData.chat
    const localUserId = (JSON.parse(localStorage.getItem('user'))).id
    if(chatData.UserId === localUserId){
        el.classList = ('myChats chatting')
        //myChats.appendChild(el)
        
    }else{
        el.classList = ('otherChats chatting')
        //otherChats.appendChild(el)
    }
    otherChats.appendChild(el)
    
})

userForm.addEventListener('submit', function (event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const username = formData.get('user').toString()
    let userID = undefined
    try{
        localUserId = (JSON.parse(localStorage.getItem('user'))).id
    }catch(error){
        localUserId = ""
    }
    fetch('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, status: 0,userID: userID})
    })
    .then(res => res.json())
    .then(user =>{
        localStorage.setItem("user", JSON.stringify(user))
    })
    userForm.classList.add('hidden')
    userMain.classList.add('hidden')
    main.classList.remove('hidden')
})

function renderChats () {
   // myChats.innerHTML = ""
    otherChats.innerHTML = ""
    fetch('/chats')
    .then(res => res.json())
    .then(users => {
        users.forEach(chats => {
            const li = document.createElement('li')
            li.innerHTML = `${chats.chat}`
            let localUserId 
            try{
                localUserId = (JSON.parse(localStorage.getItem('user'))).id
            }catch(error){
                localUserId = ""
            }
            if(chats.UserId === localUserId){
                li.classList = ('myChats chatting')
                //myChats.appendChild(li)
            }else{
                li.classList = ('otherChats chatting')
                //
            }
            otherChats.appendChild(li)
        })
    })
    .catch(console.error)
}

function getUser(){
    const user = localStorage.getItem("user")
    if(user){
        const myUser = JSON.parse(user)
        const input = document.getElementById("user-input")
        input.value = myUser.username
        userForm.classList.add('hidden')
        userMain.classList.add('hidden')
        main.classList.remove('hidden')
    }
}

getUser()

renderChats()