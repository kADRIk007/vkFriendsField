require('./friends.css');

var friendListSortArray = [];
var newFriendsInListArray = [];
var templateFn = require('../friend-template.hbs');
var templateSortFn = require('../sort-template.hbs');
var homeworkContainer = document.querySelector('#homework-container');

var friendList = document.querySelector('#friends');
var friendListSort = document.querySelector('#friends-sort');

var friendSearch1 = document.querySelector('#friendSearch1');
var friendSearch2 = document.querySelector('#friendSearch2');
var saveButton = document.querySelector('#save');


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

function addListeners(target) {
    target.onmousedown = function (e) {

        var coords = target.getBoundingClientRect();
        var shiftX = e.pageX - coords.left;
        var shiftY = e.pageY - coords.top;

        moveAt(e);

        function moveAt(e) {
            target.style.left = e.pageX - shiftX + 'px';
            target.style.top = e.pageY - shiftY + 'px';
        }

        document.onmousemove = function (e) {
            moveAt(e);
        };

        target.onmouseup = function () {
            document.onmousemove = null;
            target.onmouseup = null;
        };

    };

    target.ondragstart = function () {
        return false;
    };

}

login()
    .then(() => callAPI('friends.get', {v: 5.62, fields: ['photo_100']}))
    .then(result => {

        if (localStorage.friendsInSortList) {
            let friendsInSortList = JSON.parse(localStorage.friendsInSortList);

            for (let i = 0; i < result.items.length; i++) {
                if (friendsInSortList.indexOf(result.items[i].id) > -1) {
                    friendListSortArray.push(result.items[i])
                }
            }

            friendListSort.innerHTML = createSortDiv(friendListSortArray);
        }

        if (localStorage.friendsInList) {
            let friendsInList = JSON.parse(localStorage.friendsInList);

            for (let i = 0; i < result.items.length; i++) {
                if (friendsInList.indexOf(result.items[i].id) > -1) {
                    newFriendsInListArray.push(result.items[i])
                }
            }

            friendList.innerHTML = createFriendDiv(newFriendsInListArray);
        }

        if (!localStorage.friendsInSortList && !localStorage.friendsInList) {

            for (let i = 0; i < result.items.length; i++) {
                newFriendsInListArray.push(result.items[i]);
            }

            friendList.innerHTML = createFriendDiv(newFriendsInListArray);
        }


        friendSearch1.addEventListener('keyup', function () {
            let value = this.value.trim();
            friendList.innerHTML = '';
            var friendListArray = [];

            for (let propi in newFriendsInListArray) {

                if (isMatching(newFriendsInListArray[propi].first_name, value) || isMatching(newFriendsInListArray[propi].last_name, value)) {

                    friendListArray.push(newFriendsInListArray[propi]);
                }
            }
            friendList.innerHTML = createFriendDiv(friendListArray);
        });

        friendSearch2.addEventListener('keyup', function () {
            let value = this.value.trim();
            friendListSort.innerHTML = '';
            let newSortArray = [];

            for (let propi in friendListSortArray) {

                if (isMatching(friendListSortArray[propi].first_name, value) || isMatching(friendListSortArray[propi].last_name, value)) {

                    newSortArray.push(friendListSortArray[propi]);
                }

                friendListSort.innerHTML = createSortDiv(newSortArray);
            }
        });

        homeworkContainer.addEventListener('click', function (e) {

            if (!e.target.dataset.role) {
                return;
            }

            if (e.target.dataset.role == 'toSort') {
                for (let i = 0; i < newFriendsInListArray.length; i++) {

                    if (newFriendsInListArray[i].id == e.target.dataset.id) {
                        friendListSortArray.push(newFriendsInListArray[i]);
                        newFriendsInListArray.splice(i, 1);
                        break;
                    }
                }
            } else if (e.target.dataset.role == 'fromSort') {
                for (let i = 0; i < friendListSortArray.length; i++) {

                    if (friendListSortArray[i].id == e.target.dataset.id) {
                        newFriendsInListArray.push(friendListSortArray[i]);
                        friendListSortArray.splice(i, 1);
                        break;
                    }
                }
            } else if (e.target.dataset.role == 'drag') {
                addListeners(e.target);
                console.log(e.target);
            }

            friendListSort.innerHTML = createSortDiv(friendListSortArray);
            friendList.innerHTML = createFriendDiv(newFriendsInListArray);
        });

        saveButton.addEventListener('click', function () {
            localStorage.friendsInSortList = JSON.stringify(friendListSortArray.map(i => i.id));
            localStorage.friendsInList = JSON.stringify(newFriendsInListArray.map(i => i.id));
        });

    });