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

        saveButton.addEventListener('click', function () {
            localStorage.friendsInSortList = JSON.stringify(friendListSortArray.map(i => i.id));
            localStorage.friendsInList = JSON.stringify(newFriendsInListArray.map(i => i.id));
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

                var DragManager = new function() {
                    var dragObject = {};
                    var self = this;

                    function onMouseDown(e) {

                        if (e.which != 1) return;

                        var elem = e.target.closest('.draggable');

                        if (!elem) return;

                        dragObject.elem = elem;
                        dragObject.downX = e.pageX;
                        dragObject.downY = e.pageY;
                        dragObject.id = elem.dataset.id;

                        return false;
                    }

                    function onMouseMove(e) {
                        if (!dragObject.elem) return;

                        if (!dragObject.avatar) {
                            var moveX = e.pageX - dragObject.downX;
                            var moveY = e.pageY - dragObject.downY;

                            if (Math.abs(moveX) < 5 && Math.abs(moveY) < 5) {
                                return;
                            }

                            dragObject.avatar = createAvatar(e);
                            if (!dragObject.avatar) {
                                dragObject = {};
                                return;
                            }

                            var coords = getCoords(dragObject.avatar);
                            dragObject.shiftX = dragObject.downX - coords.left;
                            dragObject.shiftY = dragObject.downY - coords.top;

                            startDrag(e);
                        }

                        dragObject.avatar.style.left = e.pageX - dragObject.shiftX + 'px';
                        dragObject.avatar.style.top = e.pageY - dragObject.shiftY + 'px';

                        return false;
                    }

                    function createAvatar(e) {

                        var avatar = dragObject.elem;
                        var old = {
                            parent: avatar.parentNode,
                            nextSibling: avatar.nextSibling,
                            position: avatar.position || '',
                            left: avatar.left || '',
                            top: avatar.top || '',
                            zIndex: avatar.zIndex || '',
                            padding: avatar.padding || '',
                            backgroundColor: avatar.backgroundColor || '',
                        };

                        avatar.rollback = function() {
                            old.parent.insertBefore(avatar, old.nextSibling);
                            avatar.style.position = old.position;
                            avatar.style.left = old.left;
                            avatar.style.top = old.top;
                            avatar.style.zIndex = old.zIndex;
                            avatar.style.padding = old.padding;
                            avatar.style.backgroundColor = old.backgroundColor;
                        };

                        return avatar;
                    }

                    function onMouseUp(e) {
                        if (dragObject.avatar) {
                            finishDrag(e);
                        }

                        dragObject = {};
                    }

                    function finishDrag(e) {
                        var dropElem = findDroppable(e);

                        if (!dropElem) {
                            self.onDragCancel(dragObject);
                        } else {
                            self.onDragEnd(dragObject, dropElem)
                        }
                    }

                    function startDrag(e) {
                        var avatar = dragObject.avatar;

                        document.body.appendChild(avatar);
                        avatar.style.zIndex = 9999;
                        avatar.style.position = 'absolute';
                        avatar.style.backgroundColor = '#f5f5f5';
                        avatar.style.padding = '10' + 'px';
                    }

                    function findDroppable(event) {
                        dragObject.avatar.hidden = true;

                        var elem = document.elementFromPoint(event.clientX, event.clientY);

                        if (elem == null) {
                            return null;
                        }

                        return elem.closest('.droppable');
                    }

                    document.onmousemove = onMouseMove;
                    document.onmouseup = onMouseUp;
                    document.onmousedown = onMouseDown;

                    this.onDragEnd = function(dragObject, dropElem) {
                        for (let i = 0; i < newFriendsInListArray.length; i++) {

                            if (newFriendsInListArray[i].id == dragObject.elem.dataset.id) {
                                friendListSortArray.push(newFriendsInListArray[i]);
                                newFriendsInListArray.splice(i, 1);
                                break;
                            }

                        }
                        dropElem.innerHTML = createSortDiv(friendListSortArray);
                    };

                    this.onDragCancel = function(dragObject) {
                        dragObject.avatar.rollback();
                    };


                };

                function getCoords(elem) {
                    var box = elem.getBoundingClientRect();

                    return {
                        top: box.top + pageYOffset,
                        left: box.left + pageXOffset
                    };

                }
            }

            friendListSort.innerHTML = createSortDiv(friendListSortArray);
            friendList.innerHTML = createFriendDiv(newFriendsInListArray);
        });

    });