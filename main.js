const wsUrl = window.location.origin.includes('localhost') ? "ws://localhost:3000/chats" : "wss://gjheyes.github.io/chats/"
const ws = new WebSocket("wss://newmessenger.onrender.com"),
    chatForm = document.getElementById('chat'),
    otherChats = document.getElementById('chats'),
    userForm = document.getElementById('user'),
    userMain = document.getElementById('userName'),
    main = document.getElementById('main');
console.log(wsUrl)
chatForm.addEventListener('submit', function (event) {
    
    event.preventDefault()
    const formData = new FormData(event.target),
        chat = formData.get('chat'),
        user = JSON.parse(localStorage.getItem("user")),
        body = JSON.stringify({chat, status: 0,UserId: user.id, User: localStorage.getItem("user")});
    ws.send(body)
    
    event.target.reset()
    
})



userForm.addEventListener('submit', function (event) {
    event.preventDefault()
    const formData = new FormData(event.target),
         username = formData.get('user').toString();
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
    renderChats()
})

ws.addEventListener('message', chat => {
    let chats = JSON.parse(chat.data).chatInfo
    const user = JSON.parse(chat.data).userData.User
    chats.User = user
    addChat(chats)
})

function addChat(chats){
    const msg = document.createElement('li')
    const msgName = document.createElement('li')
    const localUserId = (JSON.parse(localStorage.getItem('user'))).id
    if(chats.UserId === localUserId){
        chats.User.username = "You"
        msg.classList = ('myChats chatting')
        msgName.classList = ('myName hidden toolTip')
    }else{
        msg.classList = ('otherChats chatting')
        msgName.classList = ('otherName hidden toolTip')
    }
    msg.innerHTML =  `${chats.chat}`
    msgName.innerHTML =  `${chats.User.username} | ${new Date(chats.createdAt).toLocaleTimeString('en-GB',
    {hour: '2-digit', minute:'2-digit'})} | 
    ${new Date(chats.createdAt).toLocaleDateString('en-GB',{ year: 'numeric', year:'2-digit', month: 'short', day: 'numeric' })}`
    
    otherChats.appendChild(msg)
    otherChats.appendChild(msgName)
    otherChats.scrollIntoView(false)
}

async function renderChats () {
    otherChats.innerHTML = ""
    fetch('/chats')
    .then(res => res.json())
    .then(users => {
        users.forEach(chats => {
            addChat(chats)
        })
    })
    .catch(console.error)
}

function getUser(){
    const user = localStorage.getItem("user")
    if(user){
        userForm.classList.add('hidden')
        userMain.classList.add('hidden')
        main.classList.remove('hidden')
        renderChats()
    }
}

document.addEventListener('click', (e) =>{ //e for event
    if(e.target.matches('.chatting')){
        e.target.nextSibling.classList.toggle('hidden')
    }
})

getUser()

