function loadJSON(file) {
    return new Promise((resolve, reject) => {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', 'android_asset/www/' + file, true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function () {
            if (xobj.readyState === 4) {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                try {
                    resolve(JSON.parse(xobj.responseText));
                } catch (e) {
                    reject('Error parsing lang file "' + file + '"');
                }
            }
        };
        xobj.onerror = function () {
            reject('Error getting lang file "' + file + '"');
        };
        xobj.send(null);
    });
}

loadJSON('/langs/en.json').then((data) => {
    i18n.translator.add({values: data});
    document.addEventListener('deviceready', function () {
        new Game();
        /*rest('viewRanking').then(async data => {
            console.log(data);
            let rank = '';
            await data.forEach((score, index) => {
                rank += (index + 1) + ' - ' + score + '<br>'
            });
            const rankElm = document.createElement('div');
            rankElm.innerHTML = rank;
            rankElm.style.position = 'absolute';
            rankElm.style.top = '0';
            rankElm.style.left = '0';
            rankElm.style.padding = '8px';
            rankElm.style.backgroundColor = '#03A9F4';
            rankElm.style.color = 'white';
            document.body.append(rankElm);
        })*/
    });

}).catch(e => console.warn(e));
