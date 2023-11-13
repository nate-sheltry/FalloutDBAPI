const router = require('express').Router();
const startConnection = require('./mongodb');
const validation = require('./validation')
const { ObjectId } = require('mongodb')
const Ammo = [];
const Armor = [];

function serverError(res){
    res.status(500).json({ success: false, error: 'Internal server error' });
}

function formatObject(data, object){
    const name = Object.keys(data)[1].toString();
    object[`${name}`] = data[`${name}`];
    object[`${name}`]['_id']= data[Object.keys(data)[0]];
}

router.get('', (req, res)=>{
    try{
        res.send('server is up.');
    } catch (err){
        console.error(err);
        serverError(res)
    }
})



router.get('/:database/:collection/', async (req, res)=>{
    try{
        const start = performance.now();
        const database = req.params.database;
        const collection = req.params.collection;
        const name = req.query.name ? req.query.name.replace(/[.]/g, '_').trim().replace(/\s/g, '-') : undefined;
        const id = req.query.id ? new ObjectId(req.query.id.trim()) : undefined;
        const db = await startConnection(database, collection);
        const formattedResponse = {}

        let query = undefined;
        if(name != undefined){
            query = { [name]:{ "$exists": true} };
        }
        else if(id != undefined){
            query = { _id: id };
        }
        const response = await db.find(query).toArray();
        response.forEach(data => {
            formatObject(data, formattedResponse)
        });
        if(collection == 'Ammo' && Ammo[0] == undefined && query == undefined){
            console.log('stored data')
            Ammo[0] = formattedResponse;
        }
        else if(collection == 'Armor' && Armor[0] == undefined && query == undefined){
            console.log('stored data')
            Armor[0] = formattedResponse;
        }
        res.json(formattedResponse);
        const end = performance.now()
        console.log('Result: ' + `${end-start}`)
        console.log(process.memoryUsage())
    } catch (err){
        console.error(err);
        serverError(res)
    }
})

router.get('/Resources/:collection/library', async (req, res)=>{
    const start = performance.now();
    const collection = req.params.collection
    if(collection == 'Ammo'){
        res.json(Ammo[0]);
    }
    else if(collection == 'Armor'){
        res.json(Armor[0]);
    }
    const end = performance.now()
    console.log('Result: ' + `${end-start}`)
    console.log(process.memoryUsage())
})

module.exports = router