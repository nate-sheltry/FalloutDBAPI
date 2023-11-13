const router = require('express').Router();
const startConnection = require('./mongodb');
const validation = require('./validation')
const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb')
require('dotenv').config();
const host = process.env.HOST;

const TOKENS = process.env.API_TOKENS.replace(/[\[\] ]|\n/g, '').split(',');
const GMID = process.env.GM_USER_ID

const Ammo = [];
const Armor = [];
const Weapons = [];
const contentTypeJSON = 'application/json; charset=UTF-8';

function serverError(res){
    res.status(500).json({ success: false, error: 'Internal server error' });
}

function formatObject(data, object){
    const name = Object.keys(data)[1].toString();
    object[`${name}`] = data[`${name}`];
    object[`${name}`]['_id']= data[Object.keys(data)[0]];
}
function sortObject(data){
    const objectKeys = Object.keys(data).sort();
    const sortedObject = {}
    for(let i = 0; i < objectKeys.length; i++){
        sortedObject[objectKeys[i]] = data[objectKeys[i]];
    }
    return sortedObject;

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
        const sortedResponse = sortObject(formattedResponse)
        if(collection == 'Ammo' && Ammo[0] == undefined && query == undefined){
            console.log('stored data')
            Ammo[0] = sortedResponse;
        }
        else if(collection == 'Armor' && Armor[0] == undefined && query == undefined){
            console.log('stored data')
            Armor[0] = sortedResponse;
        }
        else if(collection == 'Weapons' && Weapons[0] == undefined && query == undefined){
            console.log('stored data')
            Weapons[0] = sortedResponse;
        }
        res.json(sortedResponse);
        const end = performance.now()
        console.log('Result: ' + `${end-start}`)
        console.log(process.memoryUsage())
    } catch (err){
        console.error(err);
        serverError(res)
    }
})

//POST

function validInput(body, collection){
    try{
        const bodyKeys = Object.keys(body);
        let expectedKeys = []
        switch(collection){
            case 'Ammo':
                expectedKeys =['name', 'value', 'ac', 'dr', 'vol', 'dmg', 'category', 'img'];
                break;
            case 'Armor':
                expectedKeys = ['name', 'value', 'ac', 'dr', 'dt', 'elecRes', 'poisRes', 'radRes', 'weight', 'otherBonuses'];
                break;
            case 'Weapons':
                expectedKeys = ['name', 'value', 'ac', 'dr', 'dt', 'elecRes', 'poisRes', 'radRes', 'weight', 'otherBonuses'];
                break;
        }
        return bodyKeys.every(key => (expectedKeys.includes(key)));
    } catch(err){
        console.log(err);
        return false
    }
}

function formatPostData(body){
    const name = body.name;
    delete body.name;
    const object = { [name]: {} }
    for(const key in body){
        object[name][key] = body[key]
    }
    return object;
}

router.post('/Resources/Ammo/newItem', validation.postAmmoValidation, async (req, res)=>{
    try{
        const token = req.query.token.trim();
        if(token != GMID && !TOKENS.includes(token)) return res.status(404).json({error: 'invalid API Token'})

        const start = performance.now();
        console.log(req.body)

        const isValid = validInput(req.body, 'Ammo')
        if(!isValid) res.status(404).json({error: "A key entered in the body was invalid for the specified data point."})

        const errors = validationResult(req);
        if(errors.isEmpty()){
            console.log('Check was Passed')
        }
        else if (!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        }

        req.body.name = req.body.name.trim().replace(/[.]/g, '_').replace(/[\s]/g, '-').toLowerCase();
        console.log(req.body)

        const postData = formatPostData(req.body)
        console.log(postData)

        const db = await startConnection('Resources', 'Ammo');
        const addedData = await db.insertOne(postData)
        res.status(201).json(addedData);
        Ammo[0] = await fetch(`${host}/Resources/Ammo`).then(data => data.json());

        const end = performance.now()
        console.log('Result: ' + `${end-start}`)
        console.log(process.memoryUsage())
    } catch (err){
        console.error(err);
        serverError(res)
    }
})

router.post('/Resources/Armor/newItem', validation.postArmorValidation, async (req, res)=>{
    try{
        const token = req.query.token.trim();
        if(token != GMID && !TOKENS.includes(token)) return res.status(404).json({error: 'invalid API Token'})

        const start = performance.now();

        const isValid = validInput(req.body, 'Armor')
        if(!isValid) res.status(404).json({error: "A key entered in the body was invalid for the specified data point."})

        const errors = validationResult(req);
        if(errors.isEmpty()){
            console.log('Check was Passed')
        }
        else if (!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        }

        const db = await startConnection('Resources', 'Armor');
        const addedData = await db.insertOne(req.body)
        res.status(201).json(addedData);

        const end = performance.now()
        console.log('Result: ' + `${end-start}`)
        console.log(process.memoryUsage())
    } catch (err){
        console.error(err);
        serverError(res)
    }
})

//PUT

router.put('/Resources/Ammo/:id', validation.putAmmoValidation, async (req, res)=>{
    let modifiedData;
    try{
        const token = req.query.token.trim();
        if(token != GMID && !TOKENS.includes(token)) return res.status(404).json({error: 'invalid API Token'})

        const start = performance.now();
        const id = req.params.id.trim();

        const isValid = validInput(req.body, 'Ammo')
        if(!isValid) res.status(404).json({error: "A key entered in the body was invalid for the specified data point."})

        const errors = validationResult(req);
        if(errors.isEmpty()){
            console.log('Check was Passed')
        }
        else if (!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        }

        const db = await startConnection('Resources', 'Ammo');
        modifiedData = await db.findOneAndUpdate(
            {_id: new ObjectId(id)},
            { $set: req.body },
            {returnOriginal: false}
        );
        if(modifiedData == null) throw new Error(`Data point with ${id} was not found.`)
        res.status(204).json(modifiedData);

        const end = performance.now()
        console.log('Result: ' + `${end-start}`)
        console.log(process.memoryUsage())
    } catch (err){
        if(modifiedData == null){
            return res.status(404).send(err);
        }
        console.error(err);
        serverError(res)
    }
})

router.put('/Resources/Armor/:id', validation.putAmmoValidation, async (req, res)=>{
    let modifiedData;
    try{
        const token = req.query.token.trim();
        if(token != GMID && !TOKENS.includes(token)) return res.status(404).json({error: 'invalid API Token'})

        const start = performance.now();
        const id = req.params.id.trim();

        const isValid = validInput(req.body, 'Armor')
        if(!isValid) res.status(404).json({error: "A key entered in the body was invalid for the specified data point."})

        const errors = validationResult(req);
        if(errors.isEmpty()){
            console.log('Check was Passed')
        }
        else if (!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        }

        const db = await startConnection('Resources', 'Armor');
        modifiedData = await db.findOneAndUpdate(
            {_id: new ObjectId(id)},
            { $set: req.body },
            {returnOriginal: false}
        );
        if(modifiedData == null) throw new Error(`Data point with ${id} was not found.`)
        res.status(204).json(modifiedData);

        const end = performance.now()
        console.log('Result: ' + `${end-start}`)
        console.log(process.memoryUsage())
    } catch (err){
        if(modifiedData == null){
            return res.status(404).send(err);
        }
        console.error(err);
        serverError(res)
    }
})

//Delete
router.delete('/:database/:collection/delete=:id', validation.deleteValidation, async (req, res) => {
    let deletedData = {};
    try {
        
        const token = req.query.token.trim();

        if(token != TOKENS[0]) return res.status(404).json({error: 'Incompatible API Token. Must be Admin.'})

        const databaseName = req.params.database.trim();
        const collection = req.params.collection.trim();

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        }
        
        const id = new ObjectId(req.params.id.trim());
        const db = await startConnection(databaseName, collection);
        deletedData = await db.deleteOne({ _id: id});
        if(deletedData.error){
            throw new Error('Document not found.');
        }
        res.status(200).json(deletedData);
    } catch (error) {
        if(deletedData.error){
            return res.status(404).send('Document not found.');
        }
        console.error(error);
        serverError(res);
    }
});

//Get From Objects in Memory
router.get('/Resources/:collection/library', async (req, res)=>{
    
    const start = performance.now();
    const collection = req.params.collection
    if(collection == 'Ammo'){
        res.status(200).json(Ammo[0]);
    }
    else if(collection == 'Armor'){
        res.status(200).set("content-type", contentTypeJSON).json(Armor[0]);
    }
    const end = performance.now()
    console.log('Result: ' + `${end-start}`)
    console.log(process.memoryUsage())
})

module.exports = router