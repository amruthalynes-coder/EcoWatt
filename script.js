let currentUser = "";
let currentRole = "";
let currentRoom = "";

let rooms = JSON.parse(localStorage.getItem("ecoRooms")) || {
    "Room 101": createRoom(),
    "Room 102": createRoom(),
    "Room 103": createRoom()
};
function saveData(){
    localStorage.setItem("ecoRooms", JSON.stringify(rooms));
}

function createRoom(){
    return {
        light:false,
        fan:false,
        energy:0,
        history:[]
    };
}

function login(){
    currentUser = document.getElementById("username").value;
    currentRole = document.getElementById("role").value;

    if(currentUser === ""){
        alert("Enter username");
        return;
    }

    document.getElementById("displayUser").innerText =
        currentUser + " (" + currentRole + ")";

    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    loadRooms();
}

function logout(){
    location.reload();
}

function loadRooms(){
    let select = document.getElementById("roomSelect");
    select.innerHTML = "";

    for(let room in rooms){
        let option = document.createElement("option");
        option.value = room;
        option.text = room;
        select.appendChild(option);
    }

    currentRoom = select.value;
    updateUI();
}

function switchRoom(){
    currentRoom = document.getElementById("roomSelect").value;
    updateUI();
}

function toggleDevice(device){

    if(currentRole === "user"){
        alert("Only Admin can control devices.");
        return;
    }

    let room = rooms[currentRoom];
    room[device] = !room[device];

    calculateEnergy();
    updateUI();
}

function calculateEnergy(){
    let room = rooms[currentRoom];
    let usage = 0;

    if(room.light) usage += 40;
    if(room.fan) usage += 70;

    room.energy += usage;
    room.history.push(room.energy);

    if(room.history.length > 5){
        room.history.shift();
    }
    saveData();
}


function calculateCarbon(energy){
    return (energy * 0.00082).toFixed(3);
}


function predictEnergy(history){
    if(history.length === 0) return 0;
    let sum = history.reduce((a,b)=>a+b,0);
    return (sum / history.length).toFixed(2);
}

function updateUI(){
    let room = rooms[currentRoom];

    document.getElementById("energy").innerText = room.energy;
    document.getElementById("carbon").innerText =
        calculateCarbon(room.energy);
    document.getElementById("prediction").innerText =
        predictEnergy(room.history);

    updateChart(room.history);
    updateLeaderboard();
}

let chart;

function updateChart(data){
    if(chart) chart.destroy();

    chart = new Chart(document.getElementById("energyChart"), {
        type: 'line',
        data: {
            labels: data.map((_,i) => "T" + (i+1)),
            datasets: [{
                label: "Energy Usage",
                data: data,
                fill: false
            }]
        }
    });
}

function updateLeaderboard(){
    let board = document.getElementById("leaderboard");
    board.innerHTML = "";

    let sorted = Object.entries(rooms)
        .sort((a,b)=>a[1].energy - b[1].energy);

    sorted.forEach((room,index)=>{
        let div = document.createElement("div");
        div.className="leaderboard-item";
        div.innerHTML =
            `<span>${index+1}. ${room[0]}</span>S
             <span>${room[1].energy} Wh</span>`;
        board.appendChild(div);
    });
    function toggleTheme(){
    document.body.classList.toggle("dark");
}
}