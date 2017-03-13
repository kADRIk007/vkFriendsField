require('./friends.css');

function login() {
    return new Promise((resolve, reject) => {
        VK.init({
            apiId: 5914508
        });
        VK.Auth.login(function (result) {
            if (result.status == 'connected') {
                resolve();
            } else {
                reject();
            }
        });
    });
}

function callAPI(method, params) {
    return new Promise((resolve, reject) => {
        VK.api(method, params, function (result) {
            if (result.error) {
                reject();
            } else {
                resolve(result.response);
            }
        });
    });
}

function createFriendDiv(friend) {
    var friendDiv = document.createElement('div');
    var nameDiv = document.createElement('div');
    var friendImg = new Image();

    friendImg.classList.add('photo');
    friendImg.src = friend.photo_100;

    nameDiv.classList.add('name');
    nameDiv.innerText = `${friend.first_name} ${friend.last_name}`;

    friendDiv.classList.add('friend');
    friendDiv.appendChild(friendImg);
    friendDiv.appendChild(nameDiv);

    return friendDiv;
}

function isMatching(full, chunk) {
    if (full.toLowerCase().indexOf(chunk.toLowerCase()) !== -1) {
        return true;
    } else {
        return false;
    }
}

var friendList = document.querySelector('#friends');
var loadFriends = document.querySelector('#loadFriends');
var friendSearch1 = document.querySelector('#friendSearch1');
var friendSearch2 = document.querySelector('#friendSearch2');

    login() //Логинимся
        .then(() => callAPI('friends.get', {v: 5.62, fields: ['photo_100']})) //Посылаем запрос на сервер в контакте
        .then(result => {
            var resultFriends = result.items;

            friendSearch1.addEventListener('keyup', function () {
                let value = this.value.trim();
                friendList.innerHTML = '';

                for (var propi in resultFriends) {
                    if (isMatching(resultFriends[propi].first_name, value) || isMatching(resultFriends[propi].last_name, value)) {
                        resultFriends
                            .map(createFriendDiv)
                            .forEach(div => friendList.appendChild(div));
                    }
                }
            })

        })
        .catch(() => console.log('всё плохо'));

