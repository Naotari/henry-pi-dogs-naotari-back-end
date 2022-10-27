const { Router } = require('express');
const { Dog } = require('../db.js');
const axios = require('axios');

const dogs = Router();

dogs.get("/",  async (req,res) => {
    try {
        const {name} = req.query
        if (name) {
            const breedList = []

            const response = await axios.get(`https://api.thedogapi.com/v1/breeds/search?q=${name}`)
            response.data.forEach(dog => {
                console.log(dog)
                if(!(breedList.includes(dog.name))) breedList.push({
                    id: dog.id,
                    image: `${dog.reference_image_id ? dog.reference_image_id === "HkC31gcNm" || dog.reference_image_id === "B12uzg9V7" || dog.reference_image_id === "_Qf9nfRzL" ? `https://cdn2.thedogapi.com/images/${dog.reference_image_id}.png` : `https://cdn2.thedogapi.com/images/${dog.reference_image_id}.jpg` : null}`,
                    name: dog.name,
                    temperament: dog.temperament,
                    weight: dog.weight.metric,
                })
            })
            
            const dogs = await Dog.findAll();
            dogs.forEach(dog => console.log(dog.name))
            const dogs2 = dogs.filter(dog => {
                const nameLow = dog.name.toLowerCase()
                return nameLow.includes(name.toLowerCase())
              })
            dogs2.forEach(dog => {
                if(!(breedList.includes(dog.name))) breedList.push({
                    id: dog.id,
                    image: dog.image,
                    name: dog.name,
                    temperament: dog.temperament,
                    weight: dog.weight,
                    created: dog.ceatedInDb
                })
            })

            if (breedList.length === 0) throw Error("No Se encontro la raza ingresada")

            res.status(201).send(breedList);
        } else {
            const breedList = []

            const response = await axios.get("https://api.thedogapi.com/v1/breeds")
            response.data.forEach(dog => {
                if(!(breedList.includes(dog.name))) breedList.push({
                    id: dog.id,
                    image: dog.image.url,
                    name: dog.name,
                    temperament: dog.temperament,
                    weight: dog.weight.metric,
                })
            })

            const dogs = await Dog.findAll();
            dogs.forEach(dog => breedList.push({
                id: dog.id,
                image: dog.image,
                name: dog.name,
                temperament: dog. temperament,
                weight: dog.weight,
                created: dog.ceatedInDb
            }))

            res.status(201).send(breedList);
        }
    } catch (error) {
        res.status(400).send(error.message)
    }
})

dogs.get("/:id",  async (req,res) => {
    try {
        const {id} = req.params;
        if(id.length > 6) {
            const dogDb = await Dog.findAll({where: {id}});
            if(dogDb.length === 0) throw Error("No Se encontro el perro");
            const dogDetails = {
                id: dogDb[0].dataValues.id,
                image: dogDb[0].dataValues.image,
                name: dogDb[0].dataValues.name,
                temperament: dogDb[0].dataValues.temperament,
                weight: dogDb[0].dataValues.weight,
                height: dogDb[0].dataValues.height,
                year: dogDb[0].dataValues.years,
                ceatedInDb: dogDb[0].dataValues.ceatedInDb
            }
            res.status(201).send(dogDetails);
            
        } else {
            console.log("esta buscando en la api");
            const response = await axios.get("https://api.thedogapi.com/v1/breeds");
            const dog = response.data.find(dog => dog.id === parseInt(id));
            if(dog.length === 0) throw Error("No Se encontro el perro");
            let year = dog.life_span.split(" years")
            year = year[0]
            const dogDetails = {
                id: dog.id,
                image: `${dog.reference_image_id ? `https://cdn2.thedogapi.com/images/${dog.reference_image_id}.jpg` : null}`,
                name: dog.name,
                temperament: dog.temperament,
                weight: dog.weight.metric,
                height: dog.height.metric,
                year
            }
            res.status(201).send(dogDetails);
        }

        
    } catch (error) {
        res.status(400).send(error.message)
    }
})

dogs.post("/", async (req,res) => {
    try {
        console.log(req.body);
        const {image, name, height, weight, years, temperament} = req.body;
        if (!name || !height || !weight) throw Error("Falta informacion del perro.")
        const newDog = await Dog.create({image, name, height, weight, years, temperament});
        res.status(201).send(newDog);
    } catch (error) {
        res.status(400).send(error.message);
    }
})



module.exports = dogs;