const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const URI = process.env.FALLOUTDB_URI;

async function connectToDB(dbName, collection){
    const client = new MongoClient(URI)
    await client.connect();

    const db = client.db(dbName);
    const coll = db.collection(collection);
    return coll;
}

module.exports = connectToDB;