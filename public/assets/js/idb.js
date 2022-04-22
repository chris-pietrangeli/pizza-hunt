// create variabe to hold db connection

const { response } = require("express");

let db;

// establish a connection to Indexeddb database called 'pizza-hunt and set it to version 1
const request = indexedDB.open('pizza_hunt', 1);

// this event will emit if the databse version changes

request.onupgradeneeded = function(event) {
    //save a reference to the database
    const db = event.target.results;

    //create an object store (table) called 'new_pizza' , set it to have an auto increment primary key of sorts

    db.createObjectStore('new_pizza', { autoIncrement: true });
};

// upon a successful
request.onsuccess = function(event) {
    //when db is successful created with its object store
    db = event.target.results;

    if (navigator.onLine) {
        uploadPizza();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    const pizzaObjectStore = transaction.objectStore('new_pizza');

    pizzaObjectStore.add(record);
};

function uploadPizza() {
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    const pizzaObjectStore = transaction.objectStore('new_pizza');

    const getAll = pizzaObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.results.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                header: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })

                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['new_pizza'], 'readwrite');

                    const pizzaObjectStore = transaction.objectStore('new_pizza');

                    pizzaObjectStore.clear();

                    alert('All saved pizza has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
};

window.addEventListener('online', uploadPizza);