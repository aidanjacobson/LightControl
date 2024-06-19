var swRegistration;
async function initializeServiceWorker() {
    //if (location.href.indexOf("duckdns") == -1) return;

    if ('serviceWorker' in navigator) {
        swRegistration = await navigator.serviceWorker.register("worker.js");
    }
    navigator.serviceWorker.addEventListener("message", async function(e) {
        if (e.data.action == "load-img") {
            // var reader = new FileReader();
            // reader.onload = function() {
            //     var url = reader.result;
            //     setAll(`url(${encodeURIComponent(url)})`);
            // }
            // reader.readAsDataURL(e.data.file);
            setAllFile(e.data.file);
            setTimeout(()=>window.close(), 500);
        }
    })
}
initializeServiceWorker();

window.addEventListener("load", function() {
    document.body.ondrop = dropFunction;
    document.body.ondragover = dragOverFunction;
})

async function dropFunction(e) {
    e.preventDefault();
    e.stopPropagation();
    var files = e.dataTransfer.files;
    var length = files.length;
    console.log(files);
    if (length == 0) return;
    // var fr = new FileReader();
    // fr.onload = function() {
    //     setAll(`url(${encodeURIComponent(fr.result)})`);
    // }
    // fr.readAsDataURL(files[0]);
    setAllFile(files[0]);
}

function dragOverFunction(e) {
    e.preventDefault();
}

function setAllFile(file) {
    return new Promise((resolve, reject) => {
        var x = new XMLHttpRequest();
        var uploadURL = "/sendImageNoScene";
        if (settings.useScene) uploadURL = "/sendImage"
        x.open("POST", baseURL + uploadURL);
        // x.setRequestHeader("Content-Type","multipart/form-data");
        var formData = new FormData();
        formData.append("image", file);
        x.onload = function() {
            resolve();
        }
        x.send(formData);
    })
}