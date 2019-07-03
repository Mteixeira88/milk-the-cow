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
