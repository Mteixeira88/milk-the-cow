document.addEventListener('deviceready', function () {
    new Game();
    rest('viewRanking').then(data => {
        const rankElm = document.createElement('div');
        rankElm.innerHTML = data;
        rankElm.style.position = 'absolute';
        rankElm.style.top = '0';
        rankElm.style.left = '0';
        document.body.append(rankElm);
        console.log(data);
    })
});
