require('./friends.css');

var friendListSortArray = [];
var templateFn = require('../friend-template.hbs');
var templateSortFn = require('../sort-template.hbs');
var homeworkContainer = document.querySelector('#homework-container');

var friendList = document.querySelector('#friends');
var friendListSort = document.querySelector('#friends-sort');

var friendSearch1 = document.querySelector('#friendSearch1');
var friendSearch2 = document.querySelector('#friendSearch2');

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

function createFriendDiv(friends) {

    return templateFn({
        friends: friends
    });
}

function createSortDiv(friends) {

    return templateSortFn({
        friends: friends
    });
}

function isMatching(full, chunk) {
    if (full.toLowerCase().indexOf(chunk.toLowerCase()) !== -1) {
        return true;
    } else {
        return false;
    }
}

login()
    .then(() => callAPI('friends.get', {v: 5.62, fields: ['photo_100']}))
    .then(result => {
        friendList.innerHTML = createFriendDiv(result.items);

        friendSearch1.addEventListener('keyup', function () {
            let value = this.value.trim();
            friendList.innerHTML = '';
            var friendListArray = [];

            for (var propi in result.items) {

                if (isMatching(result.items[propi].first_name, value) || isMatching(result.items[propi].last_name, value)) {

                    friendListArray.push(result.items[propi]);
                }
            }
            friendList.innerHTML = createFriendDiv(friendListArray);
        });

        homeworkContainer.addEventListener('click', function (e) {

            if (!e.target.dataset.role) {
                return;
            }

            if (e.target.dataset.role == 'toSort') {
                for (let i = 0; i < result.items.length; i++) {

                    if (result.items[i].id == e.target.dataset.id) {
                        friendListSortArray.push(result.items[i]);
                        result.items.splice(i, 1);
                        break;
                    }
                }
            } else if (e.target.dataset.role == 'fromSort') {
                for (let i = 0; i < friendListSortArray.length; i++) {

                    if (friendListSortArray[i].id == e.target.dataset.id) {
                        result.items.push(friendListSortArray[i]);
                        friendListSortArray.splice(i, 1);
                        break;
                    }
                }
            }

            friendListSort.innerHTML = createSortDiv(friendListSortArray);
            friendList.innerHTML = createFriendDiv(result.items);
        });

    })
    .catch(() => console.log('всё плохо'));