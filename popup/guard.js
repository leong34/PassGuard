class Item{
    constructor(domain, name, username, password, key = new Date().getTime()){
        this.domain = domain;
        this.key = key;
        this.name = name;
        this.username = username;
        this.password = password;
    }
}

var arr = [];
let map = new Map();
let tab;
let search = document.getElementById('search_field');

readFromStore();

if(document.getElementById("submitBtn") !== null && document.getElementById('url') !== null){
    document.getElementById("submitBtn").addEventListener("click", add);
    browser.tabs.query({currentWindow: true, active: true}).then(function (tabs) {
        tab = tabs[0];
        let domain = new URL(tab.url).hostname;
        let x = new URL(tab.url);
        document.getElementById('url').value = tab.url;
    }, onError);
}

if(search !== null){
    search.addEventListener("input", onSearch);
}

if(document.getElementById("hide_pass") !== null){
    document.getElementById("hide_pass").addEventListener("click", showHide);
}

function add(){
    arr.push(new Item(
                document.getElementById('url').value,
                document.getElementById('label').value, 
                document.getElementById('username').value, 
                document.getElementById('password').value));
                console.log(arr[arr.length - 1]);
    let lastIndex = arr.length - 1;
    map.set(arr[lastIndex].key, arr[lastIndex]);
    browser.storage.local.set({items: arr}).then(success, onError);
}

function success(){
    console.log("success");
}

function onError(error){
    console.log(error);
}

function readFromStore(){
    console.log("reading from store");
    var itemList = browser.storage.local.get('items').then(function(result){
        if(result.items === undefined){
            map.clear();
            return;
        }
        arr = [];
        result.items.forEach(element => {
            arr.push(new Item(element['domain'], element['name'], element['username'], element['password'], element['key']));
            map.set(element['key'], element);
            if( document.getElementById("guard_list") !== null)
                showItem(element);
        });
    }, onError);
}

function del(key){
    console.log("delete" + key);
    document.getElementById(key).parentNode.remove();
    map.delete(key);
    arr = [];
    map.forEach(element => {
        arr.push(element);
    });
    browser.storage.local.clear().then(function(){browser.storage.local.set({items: arr});}, onError);
}

function clipboardPassword(key){
    if(!navigator.clipboard){
        return
    }
    
    navigator.clipboard.writeText(map.get(key).password).then(function(){
        console.log(map.get(key).password);
        success(); 
        document.getElementById('copyPassText').setAttribute("style", "display: block; margin: 15px");
        setTimeout(function(){document.getElementById('copyPassText').setAttribute("style", "display: none");}, 3000);
    }, onError);
}

function clipboardUsername(key){
    if(!navigator.clipboard){
        return
    }
    
    navigator.clipboard.writeText(map.get(key).username).then(function(){
        console.log(map.get(key).username);
        success(); 
        document.getElementById('copyUserText').setAttribute("style", "display: block; margin: 15px");
        setTimeout(function(){document.getElementById('copyUserText').setAttribute("style", "display: none");}, 3000);
    }, onError);
}

function showItem(obj){
    let guardList = document.getElementById("guard_list");
    let child = document.createElement("div");
    let domain = new URL(obj.domain).hostname;

    if(domain != ""){
        child.innerHTML = ` <div id="${obj.key}" class="p-2 bg-light border form-control guard_group">
                            <div class="row">
                                <div class="col-2 d-flex align-items-center justify-content-center">
                                    <img src="http://${domain}/favicon.ico" style="max-width: 35px; max-height: 35px;">
                                </div>
                                <div id="edit${obj.key}" class="col-6">
                                    <div class="row">
                                        <div class="col detail">${obj.name}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col detail">${obj.username}</div>
                                    </div>
                                </div>
                                <div class="col-4 d-flex align-items-center justify-content-end">
                                    <i title="Delete" id="delbtn${obj.key}" class="fas fa-trash p-2" value="${obj.key}"></i>
                                    <a href="${obj.domain}"><i title="Open in New Tab" class="fas fa-external-link-alt p-2"></i></a>
                                    <i title="Copy Username" class="fas fa-user p-2" id="cpUser${obj.key}"></i>
                                    <i title="Copy Password" id="cp${obj.key}" class="fas fa-copy p-2"></i>
                                </div>
                            </div>
                        </div>`;
    }
    else{
        child.innerHTML = ` <div id="${obj.key}" class="p-2 bg-light border form-control guard_group">
                            <div class="row">
                                <div class="col-2 d-flex align-items-center justify-content-center">
                                    <i class="fas fa-globe-americas" style="max-width: 35px; max-height: 35px;"></i>
                                </div>
                                <div id="edit${obj.key}" class="col-6 detail">
                                    <div class="row">
                                        <div class="col detail">${obj.name}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col detail">${obj.username}</div>
                                    </div>
                                </div>
                                 <div class="col-4 d-flex align-items-center justify-content-end">
                                    <i title="Delete" id="delbtn${obj.key}" class="fas fa-trash p-2" value="${obj.key}"></i>
                                    <a href="${obj.domain}"><i title="Open in New Tab" class="fas fa-external-link-alt p-2"></i></a>
                                    <i title="Copy Username" class="fas fa-user p-2" id="cpUser${obj.key}"></i>
                                    <i title="Copy Password" id="cp${obj.key}" class="fas fa-copy p-2"></i>
                                </div>
                            </div>
                        </div>`;
    }
    guardList.appendChild(child);
    let delid = 'delbtn' + obj.key;
    let cpid = 'cp' + obj.key;
    let cpUsername = 'cpUser' + obj.key;
    let editKey = 'edit' + obj.key;

    document.getElementById(delid).addEventListener('click', function(){
        var confirmation = confirm("Are you sure to delete this?");
        if(confirmation)
            del(obj.key);
    });

    //edit on click listener
    document.getElementById(editKey).addEventListener('click', function(){enterEditPage(obj);});

    document.getElementById(cpid).addEventListener('click', function(){clipboardPassword(obj.key);});
    document.getElementById(cpUsername).addEventListener('click', function(){clipboardUsername(obj.key);});
}

function onSearch(){
    if(search.value === ""){
        arr.forEach(element => {
            document.getElementById(element.key).parentNode.setAttribute('style', 'display: block;');
        });
    }
    else{
        let searchArr = [];
        arr.forEach(element => {
            if(!(element.domain.includes(search.value) || element.name.includes(search.value) || element.username.includes(search.value))){
                document.getElementById(element.key).parentNode.setAttribute('style', 'display: none;');
            }
        });
        
    }
}

function showHide(){
    if(document.getElementById("password").type == "password"){
        document.getElementById("password").type = "text";
        document.getElementById("hide_pass").title = "Hide Password";
        document.getElementById("hide_pass").classList.remove('fa-eye-slash');
        document.getElementById("hide_pass").classList.add('fa-eye');
    }
    else{
        document.getElementById("password").type = "password";
        document.getElementById("hide_pass").title = "Show Password";
        document.getElementById("hide_pass").classList.remove('fa-eye');
        document.getElementById("hide_pass").classList.add('fa-eye-slash');
    }
}

function enterEditPage(obj){
	var documentData = ` <!DOCTYPE html>
						<html style="scrollbar-width: none;">
							<head>
								<meta charset="utf-8">
								<link rel="stylesheet" href="guard.css"/>
								<link rel="stylesheet" href="bootstrap/css/bootstrap.css"/>
								<link rel="stylesheet" href="fontawesome/css/all.css"/>
								<script src="bootstrap/js/bootstrap.js"></script>
								<style>
                                    a {
                                        color: inherit;
                                    }
                        
                                    .fas {
                                        color: rgb(133, 135, 136);
                                    }
                        
                                    .fas:hover {
                                        color: rgb(43, 43, 43);
                                    }
                        
                                    .input-icons i {
                                        position: absolute;
                                        margin-left: 10px;
                                        align-self: center;
                                    }
                                    
                                    .input-icons {
                                        width: 100%;
                                        display: flex;
                                        margin-right: 10px;
                                        position: relative;
                                    }
                                    
                                    .icon {
                                        padding: 10px;
                                        min-width: 40px;
                                    }
                                    
                                    .input-field {
                                        width: 100%;
                                        padding: 10px;
                                        padding-left: 30px;
                                    }
                        
                                    #url {
                                        background-color: #fff;
                                    }
                        
                                    .form-group {
                                        margin-bottom: 10px;
                                    }
                        
                                    #hide_pass {
                                        margin-right: 15px;
                                        right: 0;
                                    }
								</style>
							</head>
							<body class="p-3" style="overflow-x: hidden; background-color: #ebebeb;">
								<div class="container position-relative d-flex justify-content-center align-items-center flex-column" style="min-width: 450px; max-width: 450px; min-height: 550px; width: 100%">
									<h2>Edit</h2>
                                    <form action="" style="min-width: 400px;">
										<div class="form-group">
											<label for="url">Active URL</label>
											<input type="text" value="${obj.domain}" class="form-control" id="url" aria-describedby="url" readonly>
										</div>
										<div class="form-group">
										  <label for="label">Label</label>
										  <input type="text" autocomplete="off" value="${obj.name}" class="form-control" id="label" aria-describedby="label" placeholder="Enter label">
										</div>
										<div class="form-group">
											<label for="username">Username</label>
											<input type="text" autocomplete="off" value="${obj.username}" class="form-control" id="username" aria-describedby="username" placeholder="Enter username">
										  </div>
										<div class="form-group">
										  <label for="password">Password</label>
										  <div class="input-icons">
                                          <input type="password" autocomplete="off" value="${obj.password}" class="form-control" id="password" placeholder="Password">
                                            <i class="fas fa-eye-slash" id="hide_pass" title="Show Password"></i>
                                        </div>
										</div>
										
										<div class="row">
											<div class="col"><button id="cancel" type="cancel" class="btn btn-warning" style="margin-top: 20px;">CANCEL</button></div>
											<div class="col d-flex justify-content-end"><button id="updateBtn" type="button" class="btn btn-success" style="margin-top: 20px;" disabled>UPDATE</button></div>
										</div>
									</form>
								</div>
                                <div id="successText" class="alert alert-success fixed-bottom" style="display: none; margin: 15px;">Success Update</div>
							</body>
						</html>`;
						
	var newHtml = document.open("updatedForm/html");
	newHtml.write(documentData);
	newHtml.close();
    setTimeout(function(){
        document.getElementById("updateBtn").disabled = false;
        document.getElementById("hide_pass").addEventListener("click", showHide);
        document.getElementById("updateBtn").addEventListener('click', function(){
            edit(obj.key);
            console.log("UPDATED!!!!");
        });
    }, 1000);
}

function edit(key){
	var temp = new Item(
                document.getElementById('url').value,
                document.getElementById('label').value, 
                document.getElementById('username').value, 
                document.getElementById('password').value);
				
	map.set(key, temp);
	arr = []; //Empty the array
    map.forEach(element => { //Re-add all the data from the hashmap into the array
        arr.push(element);
    });
    browser.storage.local.clear().then(function(){browser.storage.local.set({items: arr});}, onError); //Clear and re-add latest array data into local storage
    document.getElementById('successText').setAttribute("style", "display: block; margin: 15px;");
    setTimeout(function(){document.getElementById('successText').setAttribute("style", "display: none");}, 3000);
}