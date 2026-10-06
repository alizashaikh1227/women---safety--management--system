// Initialize storage
if(!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify([]));
if(!localStorage.getItem('incidents')) localStorage.setItem('incidents', JSON.stringify([]));

// --- Register ---
function register(){
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    let users = JSON.parse(localStorage.getItem('users'));
    if(users.find(u=>u.username===username)){ alert('Username exists'); return; }
    users.push({username,password,role});
    localStorage.setItem('users',JSON.stringify(users));
    alert('Registered Successfully'); window.location.href='index.html';
}

// --- Login ---
function login(){
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    let users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u=>u.username===username && u.password===password && u.role===role);
    if(user){ localStorage.setItem('currentUser',JSON.stringify(user)); 
        if(role==='user') window.location.href='dashboard.html'; 
        else window.location.href='admin.html'; 
    } else alert('Invalid credentials');
}

// --- Logout ---
function logout(){ localStorage.removeItem('currentUser'); window.location.href='index.html'; }

// --- Dashboard Username ---
if(document.getElementById('userWelcome')){
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if(!user) window.location.href='index.html';
    document.getElementById('userWelcome').innerText = user.username;
}

// --- Tabs ---
function showTab(tabId){
    const tabs = document.getElementsByClassName('tabContent');
    for(let i=0;i<tabs.length;i++){ tabs[i].style.display='none'; }
    document.getElementById(tabId).style.display='block';
}
showTab('sosTab'); // default tab

// --- SOS ---
function sendSOS(){ alert('🚨 Emergency Alert Sent! Authorities notified.'); }

// --- Report Incident ---
function reportIncident(){
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const title = document.getElementById('incidentTitle').value;
    const desc = document.getElementById('incidentDesc').value;
    if(title==''||desc==''){ alert('Fill all fields'); return; }
    let incidents = JSON.parse(localStorage.getItem('incidents'));
    incidents.push({username:user.username,title,description:desc});
    localStorage.setItem('incidents',JSON.stringify(incidents));
    alert('Incident Reported!'); document.getElementById('incidentTitle').value=''; document.getElementById('incidentDesc').value='';
}

// --- Admin Reports & Chart ---
if(document.getElementById('reportsTable')){
    const incidents = JSON.parse(localStorage.getItem('incidents'));
    const table = document.getElementById('reportsTable');
    incidents.forEach(inc=>{
        const row = table.insertRow();
        row.insertCell(0).innerText=inc.username;
        row.insertCell(1).innerText=inc.title;
        row.insertCell(2).innerText=inc.description;
    });
    const ctx = document.getElementById('incidentChart').getContext('2d');
    const incidentCount={};
    incidents.forEach(i=>{ incidentCount[i.username]=(incidentCount[i.username]||0)+1; });
    new Chart(ctx,{type:'bar',data:{labels:Object.keys(incidentCount),datasets:[{label:'Number of Incidents',data:Object.values(incidentCount),backgroundColor:'rgba(255,75,43,0.7)'}]},options:{responsive:true}});
}

// --- Google Maps ---
let map,userMarker;
function initMap(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position=>{
            const pos={lat:position.coords.latitude,lng:position.coords.longitude};
            map=new google.maps.Map(document.getElementById('map'),{center:pos,zoom:15});
            userMarker=new google.maps.Marker({position:pos,map:map,title:'You are here'});
        },()=>{ alert('Geolocation failed!'); });
    } else alert('Geolocation not supported!');
}

// --- Helplines ---
const helplines=[
    {name:'Police Station',lat:0.001,lng:0.002,number:'100'},
    {name:'Women Help Center',lat:0.003,lng:0.004,number:'1091'},
    {name:'Hospital',lat:0.002,lng:-0.001,number:'102'}
];
function showNearbyHelplines(){
    const list=document.getElementById('helplineList'); list.innerHTML='';
    const userPos=userMarker.getPosition();
    helplines.forEach(h=>{
        const distance=Math.sqrt(Math.pow(userPos.lat()-h.lat,2)+Math.pow(userPos.lng()-h.lng,2)).toFixed(3);
        const li=document.createElement('li');
        li.innerText=`${h.name} - Call: ${h.number} (Approx ${distance} km away)`; list.appendChild(li);
        new google.maps.Marker({position:{lat:userPos.lat()+h.lat,lng:userPos.lng()+h.lng},map:map,title:h.name});
    });
}

