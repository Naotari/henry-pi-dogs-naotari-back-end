const { Router } = require('express');
const axios = require('axios');
const { Dog } = require('../db.js');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const dogs = require("./dogs")
const { Temperament } = require('../db.js');


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


router.use("/dogs", dogs)


router.get("/temperaments", async (req,res) => {
    try {

        const temperamentsTemp = []
            
        const response = await axios.get("https://api.thedogapi.com/v1/breeds")
        response.data.forEach(dog => {
            if(dog.temperament) {
                const temp = dog.temperament.split(", ")
                temp.forEach(tempU => {
                    if(!(temperamentsTemp.includes(tempU))) temperamentsTemp.push(tempU)
                })
            }
        })

        const dogs = await Dog.findAll();
        dogs.forEach(dog => {
            if(dog.temperament) {
                const temp = dog.temperament.split(", ")
                temp.forEach(tempU => {
                    if(!(temperamentsTemp.includes(tempU))) temperamentsTemp.push(tempU)
                })
            }
        })

        temperamentsTemp.forEach(temTemp => Temperament.findOrCreate({
            where: {name: temTemp},
            default: {
                name: temTemp
            }
        }));

        const temperaments = await Temperament.findAll()
        res.status(201).send(temperaments)
    } catch (error) {
        res.status(400).send(error.message)
    }
})



module.exports = router;
