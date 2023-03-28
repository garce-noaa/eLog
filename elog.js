var rowid = 1;
var arrayc = 0;
var editidx = [];
var editint = [];
var logidx = [];
var clk2 = new Boolean(false);
var editIndex = 0;
var resultTxt = "";
var resultTxt2 = "";
var serverFiles = [];
var uploadFiles = [];
var uploadStatus = [];
var token = "";
var delidx = [];
var delint = [];
var clk = new Boolean(false);
var latdec = 0;
var londec = 0;
var tripdata = [["ID", "Date", "Code", "Latitude", "Longitude", "Species", "Kept", "Discard","Hours","Comments"]];

localObjects();
openClient();
reportOnlineStatus();
getLocation();

var datevar = new Date();
var datecnt = new Date();
document.getElementById('tripDate').valueAsDate = datevar;

if (sessionStorage.hasOwnProperty("token")){
     getFiles();
}   

const tokentimer = setInterval(clientOAuth(), 3600000);

function openClient(){
    if (localStorage.getItem('credentials.json') !== null) {
        const obj = JSON.parse(localStorage.getItem('credentials.json'));
        document.getElementById('username').value = obj.client_id;
        document.getElementById('pass').value = obj.client_secret;    
        document.getElementById("cachepass").checked = true;
    } else {
        document.getElementById("console").innerHTML = document.getElementById("console").value + "Credentials not found. \n";
    }
}

function checkLatDeg(input) { 
    if (parseInt(input.value) < 0 || parseInt(input.value) > 90 || isNaN(input.value) ) {
    alert('Latitude value must be between 0 and 90');
    input.value = '';
    }     
} 
function checkLonDeg(input) {
   if (parseInt(input.value) < 0 || parseInt(input.value) > 180 || isNaN(input.value)) {
    alert('Longitude value must be between 0 and 180');
    input.value = '';
   } 
}
function checkMin(input) {
   if (parseInt(input.value) < 0 || parseInt(input.value) > 60 || isNaN(input.value)) {
    alert('Input value must be between 0 and 60');
    input.value = '';
   } 
}

function checkMin(input) {
   if (parseInt(input.value) < 0 || parseInt(input.value) > 60 || isNaN(input.value)) {
    alert('Input value must be between 0 and 60');
    input.value = '';
   } 
}

function checkCatch(input) {
   if (isNaN(input.value)) {
    alert('Input must be numeric');
    input.value = '';
   } 
}

function toggleEdit(el, className) {
    var idx = el.rowIndex;   
    if (editint.length > 0){        
        document.getElementById("localfiles").getElementsByTagName("tr")[editint].className = "";
        editint = [];
        editidx = [];
    }         
    if (el.className.indexOf(className) >= 0) {        
        el.className = el.className.replace(className,"");
        clk2 = false;              
    } else {
        el.className  += className;
        clk2 = true;
    }    
    if (clk2 === true){       
    //editidx.push(idx);
    editint.push(idx);
    editidx.push(el.getElementsByTagName("td")[0].innerText);
    }       
}

function editLog(){
    if (editidx.length <= 0){
         window.alert("No entry selected");      
         return;
    }          
    sessionStorage.setItem("logidx", editidx);     
    localObjects();
    editidx = [];
    editint = [];    
    tripInfo();
    openLog();
}

function createLog(){         
    sessionStorage.removeItem("logidx");  
    tripInfo();
}



function deleteLog(){
    if (editidx.length <= 0){
         window.alert("No entry selected.");      
         return;
    }  
    var log = localStorage.getItem(editidx[0]);
    
    if (confirm("Confirm delete log: "+editidx[0]) === true) {
        localStorage.removeItem(editidx[0]);
    }     
    editidx = [];
    editint = [];
    localObjects();
}

function localObjects(){
    uploadFiles = [];
    const tbl = document.getElementById("localfiles");  
    const tbody=tbl.getElementsByTagName("tbody").item(0);
    const row = document.createElement("tr");   
    for (var j = tbl.rows.length-1; j>0; j--) {
        tbody.deleteRow(tbl.rows[j]);
    }    
    for(let i = 0; i < Object.keys(localStorage).length; i++){   
        uploadFiles[i] = Object.keys(localStorage)[i]; 
        
    }       
    for (var j = 0; j < uploadFiles.length; j++){
        if (uploadFiles[j].includes("credentials.json")){  
            uploadFiles.splice(j,1);    
        }               
    }
    for(let i = 0; i < uploadFiles.length; i++){   
        const row = document.createElement("tr");   
        row.setAttribute("onclick","toggleEdit(this,'selected');"); 
        const fileNameCell = document.createElement("td");
        const fileName = document.createTextNode(uploadFiles[i]);
        const fileStatusCell = document.createElement("td");    
        const fileStatus = document.createTextNode(uploadStatus[i]);
        fileNameCell.appendChild(fileName);
        fileStatusCell.appendChild(fileStatus);      
        row.appendChild(fileNameCell);
        row.appendChild(fileStatusCell);   
        tbody.appendChild(row);         
    }         
} 

function clientAuth(){    
    let user = document.getElementById('username').value;
    let pass = document.getElementById('pass').value;    
    if (document.getElementById("cachepass").checked === true){        
        var client = '{"client_id":"'+user+'","client_secret":"'+pass+'"}';
        window.localStorage.setItem("credentials.json", client);
    }   
    let authstr = btoa(user+":"+pass);     
    let xhr = new XMLHttpRequest();     
    xhr.open("GET", "https://reports.psmfc.org/pacfindev/garce/elog/trips/", true);
    //xhr.setRequestHeader("Authorization", "Basic " + authstr);
    xhr.send();
    
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("console").innerHTML = document.getElementById("console").value + "Database authentication successful \n";
            resultTxt = xhr.responseText;
            listFiles();
        }
    }; 
}

function clientOAuth(){    
    //if (sessionStorage.hasOwnProperty("token")){
    //     return;
    //}         
    let user = document.getElementById('username').value;
    let pass = document.getElementById('pass').value;    
    if (document.getElementById("cachepass").checked === true){        
        var client = '{"client_id":"'+user+'","client_secret":"'+pass+'"}';
        window.localStorage.setItem("credentials.json", client);
    }   
    let authstr = btoa(user+":"+pass);     
    let xhr = new XMLHttpRequest();     
    xhr.open("POST", "https://reports.psmfc.org/pacfindev/garce/oauth/token", true);    
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Authorization", "Basic " + authstr);
    xhr.send('grant_type=client_credentials');
    
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("console").innerHTML = document.getElementById("console").value + "Database authentication successful. \n";
            token = JSON.parse(xhr.responseText).access_token;
            sessionStorage.setItem("token", token);             
            getFiles();
        }
        if (this.readyState === 4 && this.status !== 200) {
            document.getElementById("console").innerHTML = document.getElementById("console").value + "Database authentication failed. \n";            
        }
    };        
}

function uploadLog(){
    if (editidx.length <= 0){
         window.alert("No entry selected");      
         return;
    }       
    const tbody=document.getElementById("localfiles").getElementsByTagName("tbody").item(0);    
    for (let i = 0; i< tbody.rows.length; i++){        
        if (tbody.rows[i].cells[0].innerHTML === editidx[0]){ 
            if (tbody.rows[i].cells[1].innerHTML === "uploaded") {
                if (confirm("Log already uploaded, overwrite?") === false) {
                    return;
                 }else{
                     updateLog();
                     return;
                 } 
            }            
        }
    }
    
    let authstr = sessionStorage.getItem("token");  
    var id = editidx[0];
    var log = localStorage.getItem(editidx[0]); 
    let xhr = new XMLHttpRequest();     
    xhr.open("POST", "https://reports.psmfc.org/pacfindev/garce/elog/trips/", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");   
    xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true'); 
    xhr.setRequestHeader('id', id); 
    xhr.setRequestHeader("Authorization", "Bearer " + authstr);    
    
    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        console.log(xhr.status);
	//document.getElementById("console").innerHTML = document.getElementById("console").value+xhr.status+" \n";
        document.getElementById("console").innerHTML = document.getElementById("console").value + "Logbook file uploaded: "+id+" \n";
        //console.log(xhr.responseText);
        getFiles();
    }};
    let data = log;
    xhr.send(data);    
}



function updateLog(){
    let authstr = sessionStorage.getItem("token");  
    var id = editidx[0];
    var log = localStorage.getItem(editidx[0]); 
    let xhr = new XMLHttpRequest();     
    xhr.open("PUT", "https://reports.psmfc.org/pacfindev/garce/elog/trips/", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");   
    xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true'); 
    xhr.setRequestHeader('id', id); 
    xhr.setRequestHeader("Authorization", "Bearer " + authstr);    
    
    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        console.log(xhr.status);
	//document.getElementById("console").innerHTML = document.getElementById("console").value+xhr.status+" \n";
        document.getElementById("console").innerHTML = document.getElementById("console").value + "Logbook file updated: "+id+" \n";
        //console.log(xhr.responseText);
        getFiles();        
    }};
    let data = log;
    xhr.send(data);        
}

function batchUpload(){
    let authstr = sessionStorage.getItem("token");        
    const tbl = document.getElementById("localfiles");  
    const tbody=tbl.getElementsByTagName("tbody").item(0);        
    for (let i = 0; i< tbody.rows.length; i++){        
        if (tbody.rows[i].cells[1].innerHTML === "pending"){ 
            var id = tbody.rows[i].cells[0].innerHTML;
            var log = localStorage.getItem(tbody.rows[i].cells[0].innerHTML);
            let xhr = new XMLHttpRequest();     
            xhr.open("POST", "https://reports.psmfc.org/pacfindev/garce/elog/trips/", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");   
            xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true');     
            xhr.setRequestHeader("Authorization", "Bearer " + authstr);   
            xhr.setRequestHeader('id', id); 
            let data = log;
            xhr.send(data);    
            xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 & (xhr.status === 500 || xhr.status === 401)) {
            document.getElementById("console").innerHTML = document.getElementById("console").value + "Upload failed: "+id+" \n";
            }
            if (xhr.readyState === 4 & xhr.status === 201) { 
            document.getElementById("console").innerHTML = document.getElementById("console").value + "Logbook file uploaded: "+id+" \n";
            getFiles();
            }
            };
        }           
    }    
 }

function getFiles(){        
    let authstr = sessionStorage.getItem("token");    
    let xhr = new XMLHttpRequest();     
    xhr.open("GET", "https://reports.psmfc.org/pacfindev/garce/elog/trips/", true);    
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + authstr);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            resultTxt = xhr.responseText;
            listFiles();
        }
    }; 
}

function listFiles(){        
    var files = JSON.parse(resultTxt);
    for (var i = 0; i < files.items.length; i++){
        serverFiles[i] = files.items[i].id;        
    }    
    for (var j = 0; j < uploadFiles.length; j++){  
        uploadStatus[j] = "pending";  
        for (var k = 0; k < serverFiles.length; k++){             
            if (uploadFiles[j].toString() === serverFiles[k].toString()){            
                uploadStatus[j] = "uploaded";            
            }                
        }
    }
    localObjects();
}

function isOnLine() {
    return navigator.onLine;
}   

function reportOnlineStatus() {    
    if (isOnLine()) {
        document.getElementById("connect").value = "Online";
        document.getElementById("connect").classList.add("onlinest");
        document.getElementById("connect").classList.remove("offlinest");
        clientOAuth();
    }
    else {
        document.getElementById("connect").value = "Offline";
        document.getElementById("connect").classList.add("offlinest");
        document.getElementById("connect").classList.remove("onlinest");
    }
}
window.addEventListener("online", function () {
    reportOnlineStatus();
}, true);
window.addEventListener("offline", function () {
    reportOnlineStatus();
}, true);




function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
     alert("Geolocation is not supported by this browser.");
  }
}
    
function showPosition(position) {
    
   latdec =  position.coords.latitude.toString();
   londec =  position.coords.longitude.toString();    
   let latdeg = Math.abs(parseInt(position.coords.latitude.toString().split(".")[0]));
   let latmin = parseFloat("0."+position.coords.latitude.toString().split(".")[1])*60;
   let latsec = parseInt(latmin.toString().split(".")[1])*60;   
   let londeg = Math.abs(parseInt(position.coords.longitude.toString().split(".")[0]));
   let lonmin = parseFloat("0."+position.coords.longitude.toString().split(".")[1])*60;
   let lonsec = parseInt(lonmin.toString().split(".")[1])*60;
   
   document.getElementById('latDeg').value = latdeg.toString();
   document.getElementById('latMin').value = latmin.toString().split(".")[0];
   document.getElementById('lonDeg').value = londeg.toString();
   document.getElementById('lonMin').value = lonmin.toString().split(".")[0];
      
   if (latdec > 0){
       document.getElementById("latNS").value = "N";       
   }if (latdec < 0){
       document.getElementById("latNS").value = "S";       
   }
   if (londec > 0){
       document.getElementById("lonEW").value = "E";       
   }if (londec < 0){
       document.getElementById("lonEW").value = "W";       
   }
}

function checkLatDeg(input) { 
    if (parseInt(input.value) < 0 || parseInt(input.value) > 90 || isNaN(input.value) ) {
    alert('Latitude value must be between 0 and 90');
    input.value = '';
    }     
} 
function checkLonDeg(input) {
   if (parseInt(input.value) < 0 || parseInt(input.value) > 180 || isNaN(input.value)) {
    alert('Longitude value must be between 0 and 180');
    input.value = '';
   } 
}
function checkMin(input) {
   if (parseInt(input.value) < 0 || parseInt(input.value) > 59 || isNaN(input.value)) {
    alert('Input value must be between 0 and 60');
    input.value = '';
   } 
}

function checkMin(input) {
   if (parseInt(input.value) < 0 || parseInt(input.value) > 59 || isNaN(input.value)) {
    alert('Input value must be between 0 and 60');
    input.value = '';
   } 
}
function checkCatch(input) {
   if (isNaN(input.value)) {
    alert('Input must be numeric');
    input.value = '';
   } 
}

function addEntry() {    
    if ((document.getElementById('tripDate').value === "")||(document.getElementById('latDeg').value === "")||
        (document.getElementById('latMin').value === "")||(document.getElementById('lonDeg').value === "")||
        (document.getElementById('lonMin').value === "") ){
         window.alert("Date, Latitude and Longitude fields cannot be blank."); 
         return;
    }          
    const rowNoStr = parseInt(rowid);  
    const tripDateStr = document.getElementById('tripDate').value.split('-')[1]+"/"+document.getElementById('tripDate').value.split('-')[2]+"/"+document.getElementById('tripDate').value.split('-')[0];    
    const fishingCodeStr = document.getElementById('fishingCode').value;   
    const latDegStr = document.getElementById('latDeg').value+"\u00B0";
    const latMinStr = document.getElementById('latMin').value+"'";
    const latNSStr = document.getElementById('latNS').value;  
    const lonDegStr = document.getElementById('lonDeg').value+"\u00B0";
    const lonMinStr = document.getElementById('lonMin').value+"'";
    const lonNSStr = document.getElementById('lonEW').value;
    const latStr = latDegStr+latMinStr+latNSStr;
    const lonStr = lonDegStr+lonMinStr+lonNSStr;
    
    tripdata.push([rowNoStr, tripDateStr, fishingCodeStr, latStr, lonStr, "", "", "","",""]);
        
    const tbl = document.getElementById("triptable");
    const tbody=tbl.getElementsByTagName("tbody").item(0);    
    for (var j = tbl.rows.length-1; j>0; j--) {
        tbody.deleteRow(tbl.rows[j]);
    }    
    
    for (var i = 1; i < tripdata.length; i++){
        const row = document.createElement("tr");   
        row.setAttribute("onclick","toggleClass(this,'selected');"); 
        const rowNoCell = document.createElement("td");
        const rowNo = document.createTextNode(tripdata[i][0]);
        const tripDateCell = document.createElement("td");    
        const tripDate = document.createTextNode(tripdata[i][1]);
        const fishingCodeCell = document.createElement("td");
        const fishingCode = document.createTextNode(tripdata[i][2]);
        const latCell = document.createElement("td");
        const latDeg = document.createTextNode(tripdata[i][3]);
        const lonCell = document.createElement("td");
        const lonDeg = document.createTextNode(tripdata[i][4]);
       
        rowNoCell.appendChild(rowNo);
        tripDateCell.appendChild(tripDate);
        fishingCodeCell.appendChild(fishingCode);
        latCell.appendChild(latDeg);
        lonCell.appendChild(lonDeg);       
        row.appendChild(rowNoCell);
        row.appendChild(tripDateCell);
        row.appendChild(fishingCodeCell); 
        row.appendChild(latCell); 
        row.appendChild(lonCell);         
        tbody.appendChild(row);     
    }
           
    rowid++;
    
    datecnt = document.getElementById('tripDate').valueAsDate;   
    datecnt.setDate(datecnt.getDate()+1);    
    document.getElementById('tripDate').valueAsDate = datecnt;
} 

function deleteEntry(){    
    if (delint.length === 0){
         window.alert("No entry selected");     
         return;
    }   
    
    var n = delint[0];
    tripdata.splice(n,1);
    
    const tbl = document.getElementById("triptable");
    const tbody=tbl.getElementsByTagName("tbody").item(0);  
   
    
    for (var i = 1; i < tripdata.length; i++){
        tripdata[i][0] = i;        
    }    
    for (var j = tbl.rows.length-1; j>0; j--) {
        tbody.deleteRow(tbl.rows[j]);
    }      
    for (var i = 1; i < tripdata.length; i++){
        const row = document.createElement("tr");   
        row.setAttribute("onclick","toggleClass(this,'selected');"); 
        const rowNoCell = document.createElement("td");
        const rowNo = document.createTextNode( tripdata[i][0]);
        const tripDateCell = document.createElement("td");    
        const tripDate = document.createTextNode( tripdata[i][1]);
        const fishingCodeCell = document.createElement("td");
        const fishingCode = document.createTextNode( tripdata[i][2]);
        const latCell = document.createElement("td");
        const latDeg = document.createTextNode( tripdata[i][3]);
        const lonCell = document.createElement("td");
        const lonDeg = document.createTextNode( tripdata[i][4]);       

        rowNoCell.appendChild(rowNo);
        tripDateCell.appendChild(tripDate);
        fishingCodeCell.appendChild(fishingCode);
        latCell.appendChild(latDeg);
        lonCell.appendChild(lonDeg);       
        row.appendChild(rowNoCell);
        row.appendChild(tripDateCell);
        row.appendChild(fishingCodeCell); 
        row.appendChild(latCell); 
        row.appendChild(lonCell);        
        tbody.appendChild(row);     
    } 
    
    rowid = tripdata.length;
    delidx = [];
    delint = [];  
    
    datecnt = document.getElementById('tripDate').valueAsDate;   
    datecnt.setDate(datecnt.getDate()-1);     
    document.getElementById('tripDate').valueAsDate = datecnt;
}

function toggleClass(el, className) {
    var idx = el.getElementsByTagName("td")[0].innerText;   
    if (delint.length > 0){        
        document.getElementById("triptable").getElementsByTagName("tr")[delint].className = "";
        delidx = [];
    }         
    if (el.className.indexOf(className) >= 0) {        
        el.className = el.className.replace(className,"");
        clk = false;              
    } else {
        el.className  += className;
        clk = true;
    }    
    if (clk === true){    
    delidx.push(idx);
    } 
    delint = delidx.map(Number);  
    delint.sort(function(a,b) { return a - b; });          
}

function openLog(){
    var logidx = sessionStorage.getItem("logidx");   
    var log = localStorage.getItem(logidx);
    var jsonlog = JSON.parse(log);    
    rowid = jsonlog.js_trip.tripData.length+1;
    
    tripdata = [["ID", "Date", "Code", "Latitude", "Longitude", "Species", "Kept", "Discard","Hours","Comments"]];
    
    var depDateStr = jsonlog.js_trip.departureDate.split("/");    
    var depDateFormatStr = depDateStr[2]+"-"+depDateStr[0]+"-"+depDateStr[1];     
    var arrDateStr = jsonlog.js_trip.arrivalDate.split("/");    
    var arrDateFormatStr = arrDateStr[2]+"-"+arrDateStr[0]+"-"+arrDateStr[1];  
    
    
    
    if (jsonlog.js_trip.tripData.length > 0){
    var datecnt = jsonlog.js_trip.tripData[jsonlog.js_trip.tripData.length-1].tripDate; 
    datevar.setFullYear(datecnt.split('/')[2], datecnt.split('/')[0]-1, datecnt.split('/')[1]);    
    datevar.setDate(datevar.getDate()+1);
    }
        
    document.getElementById("logtitle").innerHTML = logidx;
    document.getElementById("tripDate").valueAsDate = datevar;    
    document.getElementById("vesselName").value = jsonlog.js_trip.vesselName;
    document.getElementById("captainName").value = jsonlog.js_trip.captainName;
    document.getElementById("departurePort").value = jsonlog.js_trip.departurePort;
    document.getElementById("departureDate").value = depDateFormatStr;
    document.getElementById("arrivalPort").value = jsonlog.js_trip.arrivalPort;
    document.getElementById("arrivalDate").value = arrDateFormatStr;
    document.getElementById("docNumber").value = jsonlog.js_trip.docNumber;
    document.getElementById("portLanded").value = jsonlog.js_trip.portLanded;
    document.getElementById("landingReceipt").value = jsonlog.js_trip.landingReceipt;
    document.getElementById("poundsLanded").value = jsonlog.js_trip.poundsLanded;
    document.getElementById("gear").value = jsonlog.js_trip.gear;    
    
    const tbl = document.getElementById("triptable");
    const tbody=tbl.getElementsByTagName("tbody").item(0);    
    for (var j = tbl.rows.length-1; j>0; j--) {
        tbody.deleteRow(tbl.rows[j]);
    }    
    
    for (var i = 1; i < jsonlog.js_trip.tripData.length+1; i++){
        tripdata.push([parseInt(i), jsonlog.js_trip.tripData[i-1].tripDate, jsonlog.js_trip.tripData[i-1].fishingCode, jsonlog.js_trip.tripData[i-1].latDegMin, 
            jsonlog.js_trip.tripData[i-1].lonDegMin, jsonlog.js_trip.tripData[i-1].speciesName, jsonlog.js_trip.tripData[i-1].numberKept, jsonlog.js_trip.tripData[i-1].numberDiscarded, 
            jsonlog.js_trip.tripData[i-1].hoursFished, jsonlog.js_trip.tripData[i-1].comments]);         
    }
    
    for (var i = 1; i < tripdata.length; i++){
        const row = document.createElement("tr");   
        row.setAttribute("onclick","toggleClass(this,'selected');"); 
        const rowNoCell = document.createElement("td");
        const rowNo = document.createTextNode( tripdata[i][0]);
        const tripDateCell = document.createElement("td");    
        const tripDate = document.createTextNode( tripdata[i][1]);
        const fishingCodeCell = document.createElement("td");
        const fishingCode = document.createTextNode( tripdata[i][2]);
        const latCell = document.createElement("td");
        const latDeg = document.createTextNode( tripdata[i][3]);
        const lonCell = document.createElement("td");
        const lonDeg = document.createTextNode( tripdata[i][4]);       

        rowNoCell.appendChild(rowNo);
        tripDateCell.appendChild(tripDate);
        fishingCodeCell.appendChild(fishingCode);
        latCell.appendChild(latDeg);
        lonCell.appendChild(lonDeg);       
        row.appendChild(rowNoCell);
        row.appendChild(tripDateCell);
        row.appendChild(fishingCodeCell); 
        row.appendChild(latCell); 
        row.appendChild(lonCell);        
        tbody.appendChild(row);     
    } 

    const thead=tbl.getElementsByTagName("th");    
    for (var j = thead.length-1; j>0; j--) {
        thead[j].setAttribute("onclick","");
    }    

    delint = []; 
    delidx = []; 

}

function editEntry(){
    if (delint.length <= 0){
         window.alert("No entry selected");      
         return;
    }     
    document.getElementById("editEntry").style.display="none";
    document.getElementById("saveEntry").style.display="inline";
    document.getElementById("deleteEntry").setAttribute("onclick","");        
    document.getElementById("addEntry").setAttribute("onclick","");   
    document.getElementById("saveLog").setAttribute("onclick","");   

    var i = delint[0];
    editIndex = i;
    const tbody = document.getElementById("triptable");  
    //const tbody=tbl.getElementsByTagName("tbody").item(0);
    const rows = tbody.getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++){
        rows[i].setAttribute("onclick","");        
    }  
         
    var date = tbody.rows[i].cells[1];
    var fishingCode = tbody.rows[i].cells[2];
    var lat =  tbody.rows[i].cells[3];
    var lon =  tbody.rows[i].cells[4];    
    
    var dateStr = tbody.rows[i].cells[1].innerHTML.toString().split("/");    
    var dateFormatStr = dateStr[2]+"-"+dateStr[0]+"-"+dateStr[1];       
    var fishOption = tbody.rows[i].cells[2].innerHTML.toString();
    var latOption = lat.innerHTML.slice(-1);
    var lonOption = lon.innerHTML.slice(-1);    
    var latDegStr = lat.innerHTML.split("\xB0")[0];
    var latMinStr = lat.innerHTML.split("\xB0")[1].split("'")[0];
    var lonDegStr = lon.innerHTML.split("\xB0")[0];
    var lonMinStr = lon.innerHTML.split("\xB0")[1].split("'")[0];

    document.getElementById("tripDate").value = dateFormatStr;
    document.getElementById("fishingCode").value = fishOption;
    document.getElementById("latDeg").value = latDegStr;
    document.getElementById("latMin").value = latMinStr;
    document.getElementById("latNS").value = latOption;
    document.getElementById("lonDeg").value = lonDegStr;
    document.getElementById("lonMin").value = lonMinStr;
    document.getElementById("lonEW").value = lonOption;
    
    datevar.setDate(datevar.getDate());       
}

function saveEntry(){ 
        
    const i = editIndex;
    const tbody = document.getElementById("triptable");         

    var date = document.getElementById('tripDate').value.split('-')[1]+"/"+document.getElementById('tripDate').value.split('-')[2]+"/"+document.getElementById('tripDate').value.split('-')[0]; 
    var fishing = document.getElementById("fishingCode").value;
    var lat =  document.getElementById('latDeg').value+"\u00B0"+document.getElementById('latMin').value+"'"+document.getElementById('latNS').value;
    var lon =  document.getElementById('lonDeg').value+"\u00B0"+document.getElementById('lonMin').value+"'"+document.getElementById('lonEW').value;
    
    tripdata[i][1] = date;   
    tripdata[i][2] = fishing;
    tripdata[i][3] = lat;
    tripdata[i][4] = lon;     
    
    tbody.rows[i].cells[1].innerHTML = date;
    tbody.rows[i].cells[2].innerHTML = fishing;
    tbody.rows[i].cells[3].innerHTML = lat;
    tbody.rows[i].cells[4].innerHTML = lon;   
    
    document.getElementById("editEntry").style.display="inline";
    document.getElementById("saveEntry").style.display="none";
    
    const rows = tbody.getElementsByTagName("tr");
    for (let i = 1; i < rows.length; i++){
        rows[i].setAttribute("onclick","toggleClass(this,'selected');");  
        rows[i].className = "";
    }    
    document.getElementById("deleteEntry").setAttribute("onclick","deleteEntry()");        
    document.getElementById("addEntry").setAttribute("onclick","addEntry()"); 
    document.getElementById("saveLog").setAttribute("onclick","saveLog()");   
    document.getElementById("tripDate").valueAsDate = datecnt;
    document.getElementById("fishingCode").value = "";   
    document.getElementById("speciesName").value = "";
    document.getElementById("catchKept").value = "";
    document.getElementById("catchDiscarded").value = "";
    document.getElementById("hoursFished").value = "";
    document.getElementById("comments").value = ""; 
    
    delint = [];
    delidx = [];
}

function addCatch(){
    if (delint.length <= 0){
         window.alert("No entry selected");      
         return;
    }     
    document.getElementById("saveCatch").style.display="block";  
    document.getElementById("addCatch").style.display="none";  
    document.getElementById("tablediv").style.display="none";        
    document.getElementById("tablediv").style.display="none";    
    document.getElementById("catchdiv").style.display="block";      
    document.getElementById("tripDate").disabled = true;
    document.getElementById("fishingCode").disabled = true;
    document.getElementById("latDeg").disabled = true;
    document.getElementById("latMin").disabled = true;
    document.getElementById("latNS").disabled = true;
    document.getElementById("lonDeg").disabled = true;
    document.getElementById("lonMin").disabled = true;
    document.getElementById("lonEW").disabled = true;    
    
    var i = delint[0];     
    
    document.getElementById("speciesName").value = tripdata[i][5];
    document.getElementById("catchKept").value = tripdata[i][6];
    document.getElementById("catchDiscarded").value = tripdata[i][7];
    document.getElementById("hoursFished").value = tripdata[i][8];
    document.getElementById("comments").value = tripdata[i][9];    
    
    
   
    var lat =  tripdata[i][3];
    var lon =  tripdata[i][4]; 
    
    var dateStr = tripdata[i][1].toString().split("/");    
    var dateFormatStr = dateStr[2]+"-"+dateStr[0]+"-"+dateStr[1];       
    var fishOption = tripdata[i][2].toString();
    var latOption = lat.slice(-1);
    var lonOption = lon.slice(-1);    
    var latDegStr = lat.split("\xB0")[0];
    var latMinStr = lat.split("\xB0")[1].split("'")[0];
    var lonDegStr = lon.split("\xB0")[0];
    var lonMinStr = lon.split("\xB0")[1].split("'")[0];

      
    document.getElementById("tripDate").value = dateFormatStr;
    document.getElementById("fishingCode").value = fishOption;
    document.getElementById("latDeg").value = latDegStr;
    document.getElementById("latMin").value = latMinStr;
    document.getElementById("latNS").value = latOption;
    document.getElementById("lonDeg").value = lonDegStr;
    document.getElementById("lonMin").value = lonMinStr;
    document.getElementById("lonEW").value = lonOption;    
}


function saveCatch(){
    if (delint.length <= 0){
         window.alert("No entry selected");      
         return;
    }     
    
    document.getElementById("addCatch").style.display="inline-block";  
    document.getElementById("saveLog").style.display="inline-block";  
    document.getElementById("tablediv").style.display="block";    
    document.getElementById("catchdiv").style.display="none";      
    document.getElementById("tripDate").disabled = false;
    document.getElementById("fishingCode").disabled = false;
    document.getElementById("latDeg").disabled = false;
    document.getElementById("latMin").disabled = false;
    document.getElementById("latNS").disabled = false;
    document.getElementById("lonDeg").disabled = false;
    document.getElementById("lonMin").disabled = false;
    document.getElementById("lonEW").disabled = false;    
    
    var i = delint[0]; 
         
    var date = tripdata[i][1];
    var fishingCode = tripdata[i][2];
    var lat =  tripdata[i][3];
    var lon =  tripdata[i][4]; 
    
    var dateStr = tripdata[i][1].toString().split("/");    
    var dateFormatStr = dateStr[2]+"-"+dateStr[0]+"-"+dateStr[1];       
    var fishOption = tripdata[i][2].toString();
    var latOption = lat.slice(-1);
    var lonOption = lon.slice(-1);    
    var latDegStr = lat.split("\xB0")[0];
    var latMinStr = lat.split("\xB0")[1].split("'")[0];
    var lonDegStr = lon.split("\xB0")[0];
    var lonMinStr = lon.split("\xB0")[1].split("'")[0];
      
    document.getElementById("tripDate").value = dateFormatStr;
    document.getElementById("fishingCode").value = fishOption;
    document.getElementById("latDeg").value = latDegStr;
    document.getElementById("latMin").value = latMinStr;
    document.getElementById("latNS").value = latOption;
    document.getElementById("lonDeg").value = lonDegStr;
    document.getElementById("lonMin").value = lonMinStr;
    document.getElementById("lonEW").value = lonOption;    
    
    
    
    var species = document.getElementById("speciesName").value;
    var kept = document.getElementById("catchKept").value;
    var discard = document.getElementById("catchDiscarded").value;
    var hours = document.getElementById("hoursFished").value;
    var comment = document.getElementById("comments").value;    
    
 
    tripdata[i][5] = species;
    tripdata[i][6] = kept;
    tripdata[i][7] = discard;
    tripdata[i][8] = hours;
    tripdata[i][9] = comment;
    
}


function saveLog(){    
    if((document.getElementById('vesselName').value === "")||(document.getElementById('docNumber').value === "")||
        (document.getElementById('departureDate').value === "")||(document.getElementById('arrivalDate').value === "")){
         window.alert("Required Trip Info is missing"); 
         return;
    }      
    var vesselNameId = document.getElementById("vesselName").id;
    var vesselName = document.getElementById("vesselName").value;
    var captainNameId = document.getElementById("captainName").id;
    var captainName = document.getElementById("captainName").value;
    var departurePortId = document.getElementById("departurePort").id;
    var departurePort = document.getElementById("departurePort").value;
    var departureDateId = document.getElementById("departureDate").id;
    var departureDate = document.getElementById('departureDate').value.split('-')[1]+"/"+document.getElementById('departureDate').value.split('-')[2]
            +"/"+document.getElementById('departureDate').value.split('-')[0]; 
    var arrivalPortId = document.getElementById("arrivalPort").id;
    var arrivalPort = document.getElementById("arrivalPort").value;
    var arrivalDateId = document.getElementById("arrivalDate").id;
    var arrivalDate = document.getElementById('arrivalDate').value.split('-')[1]+"/"+document.getElementById('arrivalDate').value.split('-')[2]
            +"/"+document.getElementById('arrivalDate').value.split('-')[0]; 
    var docNumberId = document.getElementById("docNumber").id;
    var docNumber = document.getElementById("docNumber").value;
    var portLandedId = document.getElementById("portLanded").id;
    var portLanded = document.getElementById("portLanded").value;
    var landingReceiptId = document.getElementById("landingReceipt").id;
    var landingReceipt = document.getElementById("landingReceipt").value;
    var poundsLandedId = document.getElementById("poundsLanded").id;
    var poundsLanded = document.getElementById("poundsLanded").value;
    var gearId = document.getElementById("gear").id;
    var gear = document.getElementById("gear").value;         
    
    const tbody = document.getElementById("triptable");   
    
    var tripdatastr = '"tripData":[';
    var tripidstr = '';
     
    for(var i = 1; i < tripdata.length; i++){  
        var latDegStr = tripdata[i][3].split("\xB0")[0];
        var latMinStr = tripdata[i][3].split("\xB0")[1];      
        var latDec = parseInt(latDegStr)+((parseInt(latMinStr)*60)/3600); 
        if (tripdata[i][3].slice(-1)==="S"){
        latDec = latDec*-1;      
        }  
        var lonDegStr = tripdata[i][4].split("\xB0")[0];
        var lonMinStr = tripdata[i][4].split("\xB0")[1];  
        var lonDec = parseInt(lonDegStr)+((parseInt(lonMinStr)*60)/3600); 
        if (tripdata[i][4].slice(-1)==="W"){
        lonDec = lonDec*-1;    
        }                    
        var triprow = '{"rowID":"'+(i)+'",'
                +'"tripDate":"'+tripdata[i][1].toString()+'",'+'"fishingCode":"'+tripdata[i][2].toString()+'",'
                +'"latDegMin":"'+tripdata[i][3].toString()+'",'+'"lonDegMin":"'+tripdata[i][4].toString()+'",'
                +'"latDec":"'+latDec+'",'+'"lonDec":"'+lonDec+'",'+'"speciesName":"'+tripdata[i][5].toString()+'",'
                +'"numberKept":"'+tripdata[i][6].toString()+'",'+'"numberDiscarded":"'+tripdata[i][7].toString()+'",'
                +'"hoursFished":"'+tripdata[i][8].toString()+'",'
                +'"comments":"'+tripdata[i][9].toString()+'"},';

        tripdatastr = tripdatastr.concat(triprow);
    }
    tripdatastr = tripdatastr.slice(0,-1);
    tripdatastr = tripdatastr.concat("]");
    
    if(tbody.rows.length <= 1){     
        tripdatastr = '"tripData":""';  
    }
    
    var objname = vesselName+"_"+docNumber+"_"+departureDate.split("/")[0]+departureDate.split("/")[1]+departureDate.split("/")[2].slice(-2)
            +"_"+arrivalDate.split("/")[0]+arrivalDate.split("/")[1]+arrivalDate.split("/")[2].slice(-2)+".json";
    
    
    tripidstr = '{"js_trip":{"'+vesselNameId+'":"'+vesselName+'","'+captainNameId+'":"'+captainName+'","'+departurePortId+'":"'+departurePort+'","'+departureDateId+'":"'+departureDate+
                  '","'+arrivalPortId+'":"'+arrivalPort+'","'+arrivalDateId+'":"'+arrivalDate+'","'+docNumberId+'":"'+docNumber+'","'+portLandedId+'":"'+portLanded+  
                  '","'+landingReceiptId+'":"'+landingReceipt+'","'+poundsLandedId+'":"'+poundsLanded+'","'+gearId+'":"'+gear+'",'+tripdatastr+'}}';    
        /*         
     tripidstr = '{"js_trip":[{"'+vesselNameId+'":"'+vesselName+'","'+captainNameId+'":"'+captainName+'","'+departurePortId+'":"'+departurePort+'","'+departureDateId+'":"'+departureDate+
                  '","'+arrivalPortId+'":"'+arrivalPort+'","'+arrivalDateId+'":"'+arrivalDate+'","'+docNumberId+'":"'+docNumber+'","'+portLandedId+'":"'+portLanded+  
                  '","'+landingReceiptId+'":"'+landingReceipt+'","'+poundsLandedId+'":"'+poundsLanded+'","'+gearId+'":"'+gear+'",'+tripdatastr+'}]}';    
  */
    if (Object.keys(localStorage).includes(objname)){         
        if (confirm("Log already exists, overwrite?") === true) {
            window.localStorage.setItem(objname, tripidstr);  
            alert("Log saved as: "+objname);
            editidx = [];   
            sessionStorage.removeItem("logidx"); 
        }        
    } else {
    window.localStorage.setItem(objname, tripidstr);      
    editidx = []; 
    sessionStorage.removeItem("logidx");  
    alert("Log saved as: "+objname);
    }  
    localObjects();
    document.getElementById("logtitle").innerHTML = objname;
}

function printLog(){        
    if (editidx.length <= 0){
         window.alert("No entry selected");      
         return;
    }          
    sessionStorage.setItem("logidx", editidx);     
    localObjects();
    editidx = [];
    editint = [];    
    
    
    
    var logidx = sessionStorage.getItem("logidx");   
    var log = localStorage.getItem(logidx);
    var jsonlog = JSON.parse(log);               
           
    const logtbl = document.createElement("table");     
    
    const logname = document.createTextNode(logidx);  
    
    const vesselC1 = document.createElement("td");
    vesselC1.appendChild(document.createTextNode("Vessel Name: "+jsonlog.js_trip.vesselName));
    const captainC1 = document.createElement("td");
    captainC1.appendChild(document.createTextNode("Captain: "+jsonlog.js_trip.captainName));
    const depportC1 = document.createElement("td");
    depportC1.appendChild(document.createTextNode("Departure Port: "+jsonlog.js_trip.departurePort));    
    const depdateC1 = document.createElement("td");
    depdateC1.appendChild(document.createTextNode("Departure Date: "+jsonlog.js_trip.departureDate));   
    const arrportC1 = document.createElement("td");
    arrportC1.appendChild(document.createTextNode("Arrival Port: "+jsonlog.js_trip.arrivalPort));
    const arrdateC1 = document.createElement("td");
    arrdateC1.appendChild(document.createTextNode("Arrival Date: "+jsonlog.js_trip.arrivalDate));  
    const docnumberC1 = document.createElement("td");
    docnumberC1.appendChild(document.createTextNode("Doc Number: "+jsonlog.js_trip.docNumber));
    const portlandC1 = document.createElement("td");
    portlandC1.appendChild(document.createTextNode("Port Landed: "+jsonlog.js_trip.portLanded));      
    const landrcptC1 = document.createElement("td");
    landrcptC1.appendChild(document.createTextNode("Receipt: "+jsonlog.js_trip.landingReceipt));   
    const lbslandedC1 = document.createElement("td");
    lbslandedC1.appendChild(document.createTextNode("Pounds Landed: "+jsonlog.js_trip.poundsLanded));  
    const fishgearC1 = document.createElement("td");
    fishgearC1.appendChild(document.createTextNode("Gear Type: "+jsonlog.js_trip.gear));  
    const fishgearC2 = document.createElement("td");    
    const row1 = document.createElement("tr");   
    const row2 = document.createElement("tr");       
    const row3 = document.createElement("tr");       
    const row4 = document.createElement("tr");   
    const row5 = document.createElement("tr");       
    const row6 = document.createElement("tr");       
    row1.appendChild(vesselC1);
    row1.appendChild(captainC1);
    row2.appendChild(depportC1);
    row2.appendChild(depdateC1);
    row3.appendChild(arrportC1);
    row3.appendChild(arrdateC1);
    row4.appendChild(docnumberC1);
    row4.appendChild(portlandC1);
    row5.appendChild(landrcptC1);
    row5.appendChild(lbslandedC1);    
    row6.appendChild(fishgearC1);         
    row6.appendChild(fishgearC2);    
    logtbl.appendChild(row1);
    logtbl.appendChild(row2);
    logtbl.appendChild(row3);
    logtbl.appendChild(row4);
    logtbl.appendChild(row5);
    logtbl.appendChild(row6);
    logtbl.setAttribute("id","logtable");   

    const tbl = document.createElement("table");        
    tbl.setAttribute("id","printtable");   

    const rowhd = document.createElement("th");   
    rowhd.appendChild(document.createTextNode("RID"));
    const datehd = document.createElement("th");   
    datehd.appendChild(document.createTextNode("Date"));
    const codehd = document.createElement("th");   
    codehd.appendChild(document.createTextNode("Code"));
    const lathd = document.createElement("th");    
    lathd.appendChild(document.createTextNode("Latitude"));
    const lonhd = document.createElement("th");      
    lonhd.appendChild(document.createTextNode("Longitude"));
    const spchd = document.createElement("th");   
    spchd.appendChild(document.createTextNode("Species"));
    const nkphd = document.createElement("th");  
    nkphd.appendChild(document.createTextNode("Kept")); 
    const ndchd = document.createElement("th");   
    ndchd.appendChild(document.createTextNode("Released"));     
    const hrshd = document.createElement("th");   
    hrshd.appendChild(document.createTextNode("Hours"));   
    const cmthd = document.createElement("th");        
    cmthd.appendChild(document.createTextNode("Comments"));           
    tbl.appendChild(rowhd);   
    tbl.appendChild(datehd); 
    tbl.appendChild(codehd); 
    tbl.appendChild(lathd); 
    tbl.appendChild(lonhd); 
    tbl.appendChild(spchd); 
    tbl.appendChild(nkphd); 
    tbl.appendChild(ndchd); 
    tbl.appendChild(hrshd); 
    tbl.appendChild(cmthd); 

    
    for (var i = 1; i < jsonlog.js_trip.tripData.length+1; i++){
        const row = document.createElement("tr");   
        const rowNoCell = document.createElement("td");
        const rowNo = document.createTextNode(parseInt(i));
        const tripDateCell = document.createElement("td");    
        const tripDate = document.createTextNode( jsonlog.js_trip.tripData[i-1].tripDate);
        const fishingCodeCell = document.createElement("td");
        const fishingCode = document.createTextNode( jsonlog.js_trip.tripData[i-1].fishingCode);
        const latCell = document.createElement("td");
        const latDeg = document.createTextNode( jsonlog.js_trip.tripData[i-1].latDegMin);
        const lonCell = document.createElement("td");
        const lonDeg = document.createTextNode( jsonlog.js_trip.tripData[i-1].lonDegMin);       
        const spcCell = document.createElement("td");
        const species = document.createTextNode( jsonlog.js_trip.tripData[i-1].speciesName);
        const nkptCell = document.createElement("td");
        const nkpt = document.createTextNode( jsonlog.js_trip.tripData[i-1].numberKept);       
        const ndcCell = document.createElement("td");
        const ndc = document.createTextNode( jsonlog.js_trip.tripData[i-1].numberDiscarded);       
        const hrsCell = document.createElement("td");
        const hrs = document.createTextNode( jsonlog.js_trip.tripData[i-1].hoursFished);       
        const cmtCell = document.createElement("td");
        const cmt = document.createTextNode( jsonlog.js_trip.tripData[i-1].comments);             

        rowNoCell.appendChild(rowNo);
        tripDateCell.appendChild(tripDate);
        fishingCodeCell.appendChild(fishingCode);
        latCell.appendChild(latDeg);
        lonCell.appendChild(lonDeg);   
        spcCell.appendChild(species);
        nkptCell.appendChild(nkpt);
        ndcCell.appendChild(ndc);            
        hrsCell.appendChild(hrs);      
        cmtCell.appendChild(cmt);  
        row.appendChild(rowNoCell);
        row.appendChild(tripDateCell);
        row.appendChild(fishingCodeCell); 
        row.appendChild(latCell); 
        row.appendChild(lonCell);   
        row.appendChild(spcCell);
        row.appendChild(nkptCell); 
        row.appendChild(ndcCell); 
        row.appendChild(hrsCell);  
        row.appendChild(cmtCell);          
        tbl.appendChild(row);     
    }     
    console.log(logtbl);
    var w = window.open();
    
    var hdoc = document.createElement("html");
    var hbody = document.createElement("body");
    var hstyle = document.createElement("style");
    hbody.appendChild(logtbl);  
    hbody.appendChild(document.createElement("br"));
    hbody.appendChild(tbl);    
    hstyle.innerHTML = '@media print, screen{ body{ -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;} table{border-collapse: collapse !important;} #printtable{ border-collapse: collapse; width: 50em; font-size: 0.8em; vertical-align: middle; border:  1px solid #cccccc; font-family: verdana; margin: 0px 0px 0px 0px; vertical-align: bottom;} \n\
                        #printtable td { border:  1px solid #cccccc; font-weight: 500; text-align: left; vertical-align: top; padding: 2px 5px 2px 5px; border-collapse: collapse;} #printtable tr { border:  1px solid #cccccc; border-collapse: collapse;} \n\
                        #printtable th { font-weight: normal; color: #F9F9F9; background: #0085CA; border:  1px solid #cccccc;} #printtable tr:nth-child(odd)  {background-color: #F4F9FD;} #printtable tr:nth-child(even) {background-color: #EDF5FC;} \n\
                        #logtable{ border-collapse: collapse; width: 40em; font-size: 0.8em; vertical-align: middle; border:  1px solid #cccccc; font-family: verdana; margin: 0px 0px 0px 0px; vertical-align: bottom;} #logtable td { border:  1px solid #cccccc; font-weight: 500; text-align: left; vertical-align: top; padding: 2px 5px 2px 5px; border-collapse: collapse;} #logtable tr { border:  1px solid #cccccc; border-collapse: collapse;} #logtable tr:nth-child(odd)  {background-color: #F4F9FD;} #logtable tr:nth-child(even) {background-color: #EDF5FC;}}';  
    hdoc.appendChild(hbody);
    hdoc.appendChild(hstyle);    

   
    w.document.write(hdoc.innerHTML);
    w.window.print();
    w.document.close();

}
