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
    if( document.getElementById("guard_list") === null)
    return;
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
            showItem(element);
        });
    }, onError);
}

// function edit(){

// }

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
                                <div class="col-6">
                                    <div class="row">
                                        <div class="col">${obj.name}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col">${obj.username}</div>
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
                                <div class="col-6">
                                    <div class="row">
                                        <div class="col">${obj.name}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col">${obj.username}</div>
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

    document.getElementById(delid).addEventListener('click', function(){
        var confirmation = confirm("Are you sure to delete this?");
        if(confirmation)
            del(obj.key);
    });

    //edit on click listener
    document.getElementById(obj.key).addEventListener('click', function(){console.log("clicked")});

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