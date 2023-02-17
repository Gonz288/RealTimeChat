const socket = io();

let chatBox = document.getElementById("chatBox");
let user;
Swal.fire({
    title: "Login",
    text: "Enter a username",
    input: "text",
    confirmButtonText : "Enter",
    allowOutsideClick: false,
    inputValidator: (value) =>{
        if(!value){
            return "Error, you must enter a valid username!";
        }
    },
}).then((result) =>{
    if(result.value){
        user = result.value;
        socket.emit("newUser", {user: user, id: socket.id});
    }
});

chatBox.addEventListener("keyup", (event) =>{
    if(event.key === "Enter"){
        if(chatBox.value.trim().length > 0){
            socket.emit("message", {
                user: user,
                message: chatBox.value,
                date: new Date().toLocaleString()
            });
            chatBox.value = "";
        }
    }
});

socket.on("messageLogs", (data) =>{
    let log = document.getElementById("messageLogs");
    let message = "";

    data.forEach((elem) =>{
        message += `
        <div class="chat-message">
            <div class="message-bubble">
                <div class="message-sender text-end fw-bold text-black text-uppercase">${elem.user}</div>
                <p>${elem.message}</p>
                <p class="fw-lighter text-blue">${elem.date}</p>
                </div>
            </div>
        `;
    });
    log.innerHTML = message;
});

socket.on("newUserConnected", (data) =>{
    if(data.id !== socket.id){
        Swal.fire({
            text:`${data.user} has connected`,
            toast: true,
            position: "top-end",
        });
    }
});

socket.on("usersLogs", (data) =>{
    let list = document.getElementById("usersList");
    let username = "";
    data.forEach((elem) =>{
        username += `
            <div class="user">
                <div class="cartelConnected">Connected</div>
                <p> <b>User:</b> ${elem.user} </p>
            </div>
        `;
    });
    list.innerHTML = username;
});

socket.on("userDisconnected", (data) =>{
    if(data.id !== socket.id){
        Swal.fire({
            text:`${data.user} has disconnected`,
            toast: true,
            position: "top-end",
        });
    }
});

function firstLoad() {
    let log = document.getElementById("messageLogs");
    fetch("/messages")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        let message = "";
        data.forEach((elem) => {
            message += `
                <div class="chat-message">
                    <div class="message-bubble">
                        <div class="message-sender text-end fw-bold text-black text-uppercase">${elem.user}</div>
                        <p>${elem.message}</p>
                        <p class="fw-lighter text-blue">${elem.date}</p>
                    </div>
                </div>
            `;
        });
    log.innerHTML = message;
    });
}
firstLoad();