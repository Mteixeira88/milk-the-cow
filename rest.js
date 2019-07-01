const endpoint = 'https://milkthecow.today/public-api.php';

function rest(action, args) {
    return new Promise((resolve, reject) => {
        const params = "data=" + JSON.stringify({
            action: action,
            args: args
        });
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                resolve(xhr.responseText);
            }
        };

        xhr.onerror = function (e) {
            reject("** An error occurred during the transaction", e);
            console.error("** An error occurred during the transaction", e);
        };

        xhr.open("POST", endpoint, true);
        //Send the proper header information along with the request
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(params);
    })
}
