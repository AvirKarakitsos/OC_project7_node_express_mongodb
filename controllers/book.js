const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');

//Get all books
exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}

//Get one book by its id
exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
}

//Select 3 highest rating books
exports.getBestRating = (req, res, next) => {
    Book.find()
    .then(books => {
        books.sort((a,b) => b.averageRating - a.averageRating); //sort book by average rating
        let result = books.slice(0,3); //select the first three books
        return result;
    })
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}

//Post a book
exports.createBook = async (req,res,next) => {
    let bookObject = JSON.parse(req.body.book);
    let name = req.file.originalname.split(' ').join('_'); //Construct a new name for the image
    let nameComplete = Date.now() + name;                  //with a unique name
    let image = sharp(req.file.buffer)
    let metadata = await image.metadata()
    
    delete bookObject.userId;
    delete bookObject.ratings;
    delete bookObject.averageRating;

    //Resize the image if the height or the width are above 450px and store this image in the disk
    if((metadata.height >= 450) || (metadata.width >= 450)) {
        if (metadata.height >= metadata.width) await image.resize(null,450).toFile(`./images/${nameComplete}`)
        else await image.resize(450,null).toFile(`./images/${nameComplete}`)
    } 
    else await image.toFile(`./images/${nameComplete}`)

    //Create a new book
    let book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        ratings: [],
        averageRating: 0,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${nameComplete}`
    });
    book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !'}))
    .catch(error => res.status(400).json({ error }));
}

//Add a score to a book
exports.addGrade = (req,res,next) => {
    Book.findOne({_id: req.params.id})
    .then(book => {
        //Test if the user has already
        if(book.ratings.some(rating => rating.userId === req.auth.userId)) {
            res.status(403).json({ message : 'unauthorized request'});
        } else {
            //Calcule the sum before adding the new score
            let sum = book.ratings.reduce((acc,curr) => {
                acc = acc + curr.grade;
                return acc;
            },0)
            //average rating updated
            let average = (sum + req.body.rating) / (book.ratings.length + 1);

            Book.updateOne({_id: req.params.id},
                    {
                        $push: {
                            ratings: {userId: req.auth.userId, grade: req.body.rating}
                        },
                        averageRating: average.toFixed(1)
                    })
            .then(() => {
                Book.findOne({_id: req.params.id})
                .then(book => res.status(201).json(book))
                .catch(error => res.status(400).json({ error }))
            })
            .catch(error => res.status(400).json({ error }))
        }
    })
    .catch(error => res.status(400).json({ error }))
}

//Modify a book
exports.updateBook = async (req, res, next) => {
    let bookObject;
    //Test if the request contains a new image
    if(req.file) {
        let name = req.file.originalname.split(' ').join('_');
        const nameComplete = Date.now() + name;
        let image = sharp(req.file.buffer)
        let metadata = await image.metadata()

        bookObject = {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${nameComplete}`
        }

        //Resize the image if the height is above 450px and register in the storage disk
        if((metadata.height >= 450) || (metadata.width >= 450)) {
            if (metadata.height >= metadata.width) await image.resize(null,450).toFile(`./images/${nameComplete}`)
            else await image.resize(450,null).toFile(`./images/${nameComplete}`)
        } 
        else await image.toFile(`./images/${nameComplete}`)
    } else {
        bookObject = { ...req.body }
    }
    
    Book.findOne({_id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(403).json({ message : 'unauthorized request'});
        } else {
            let filename = book.imageUrl.split('/images/')[1];
            //Delete the former image in the disk storage if there is a new image
            if(req.file) {
                fs.unlink(`images/${filename}`, () => {
                    Book.updateOne({_id: req.params.id}, { ...bookObject, id: req.params.id})
                    .then(() => res.status(200).json({message : 'Livre modifié!'}))
                    .catch(error => res.status(401).json({ error }));
                })
            } else {
                Book.updateOne({_id: req.params.id}, { ...bookObject, id: req.params.id})
                .then(() => res.status(200).json({message : 'Livre modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        }
    })
    .catch((error) => res.status(400).json({ error }));
}

//Delete one book
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
    .then(book => {
        if (book.userId != req.auth.userId) {
            res.status(403).json({message: 'unauthorized request'});
        } else {
            let filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                .catch(error => res.status(401).json({ error }));
            });
        }
    })
    .catch( error => res.status(500).json({ error }));
 };