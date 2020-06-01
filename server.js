const express = require('express');
const mongosee = require('mongoose');
// importando el modelo
require('./models/course');
require('./models/video');

// para ignorar los warnings de mongo
mongosee.set('useNewUrlParser', true);
mongosee.set('useUnifiedTopology', true);
// conección a la bd
mongosee.connect("mongodb://localhost/mongosee", () => {
    console.log("Connected BD successfull");
});
// iniciación de express
const app = express();

app.get('/', (req, res) => {
    res.send("Hola mundo desde el servidor");
});

//instanciando el modelo de course
const Course = mongosee.model('Course'); // pasanso el nombre del modelo tal cual

// instanciando el modelo de vidoe
const Video = mongosee.model('Video'); // pasanso el nombre del modelo tal cual

// Operaciones en la bd
//find all
app.get('/cursos', (req, res) => {
    Course.find({}).then(docs => {
        res.json(docs);
    }).catch(err => {
        res.json(err);
    });
});

//find with ocnditions
app.get('/cursosC', (req, res) => {
    Course.find({
        // title: 'Curso de Mongoose' // forma 1
        title: {
            // estar entre diagonales nos devuelve culaquier objeto que tenga esa palabra
            $regex: /curso/, // volver insensible a minusculas y minusculas
            // para que devuelva cuando la palabra esté al último solamente se pone un $ al final /name$/
            $options: 'i' // con esto
        }
    }).then(collection => {
        res.json(collection);
    }).catch(err => {
        res.json(err);
    });
});

//find and limmit the results
app.get('/cursosLimit', (req, res) => {
    Course.find({}, null, { // el tercer parametro es para especificaciones
        limit: 2, // solo va a mostar dos documentos
        skip: 1, // se saltara el primero
        sort: 'title' // campo a ordenar

    }).then(collection => {
        res.json(collection);
    }).catch(err => {
        res.json(err);
    });
});

//find with ocnditions and SPECIFIC fields
app.get('/cursosC2', (req, res) => {
    Course.find({
        // title: 'Curso de Mongoose' // forma 1
        title: {
            // estar entre diagonales nos devuelve culaquier objeto que tenga esa palabra
            $regex: /curso/, // volver insensible a minusculas y minusculas
            // para que devuelva cuando la palabra esté al último solamente se pone un $ al final /name$/
            $options: 'i' // con esto
        }
    }, ['title']).then(collection => { // poner los cmapos que queremos, en dado caso de que querams todos menos uno se pone '-nameField'
        res.json(collection);
    }).catch(err => {
        res.json(err);
    });
});

//find with ocnditions and ordered
app.get('/cursosOr', (req, res) => {
    // forma 1 - con una pripedad como argumento
    // Course.find({}, null, {
    //     sort: {
    //         description: 1 // -1 es descendente y 1 es ascendente y asignarselo al campo que qurmos ordenar
    //     }
    // forma 2, con una función
    Course.find({}).sort({
        description: 1 // -1 es descendente y 1 es ascendente y asignarselo al campo que qurmos ordenar
    }).then(collection => { // poner los cmapos que queremos, en dado caso de que querams todos menos uno se pone '-nameField'
        res.json(collection);
    }).catch(err => {
        res.json(err);
    });
});

// Conteo de registros (documentos)
app.get('/cursosCount', (req, res) => {
    // se puede usar estimatedDocumentCount - este no permite paramétros
    Course.countDocuments({ numberOfTopics: 0 }).then(collection => { // si queremos solo el numero total se deja vacio conuntDocuments() y si se necesita especificar o condicionar adentro lleva el onjeto {valores}
        res.json(collection);
    }).catch(err => {
        res.json(err);
    });
});

// Insert
app.post('/cursos', (req, res) => {
    // se crea una colección llamada curso y su documento respectivo
    Course.create({
        title: 'Curso de JS',
        description: 'A Cursos de nodejs y mongoDB '
    }).then(doc => {
        res.json(doc); // si se crea bien se manda por json
    }).catch(err => {
        console.log(err);
        res.json(err); // si hay un error lo retorna y en formato json
    });
});

// Find by id
app.get('/cursos/:id', (req, res) => {
    Course.findById(req.params.id).then(doc => {
        res.json(doc);
    }).catch(err => {
        res.json(err);
    });
});

// Update 
//find by id
app.put('/cursos/:id', (req, res) => {
    // forma 1 - no ejecuta los middlewares
    // Course.update({ numberOfTopics: 0 }, { publishedAt: new Date() }, { multi: true }).then(doc => {
    //     res.json(doc);
    // }).catch(err => {
    //     res.json(err);
    // });

    // forma 2 - esta es la forma más común de actualizar un documento
    Course.findByIdAndUpdate(req.params.id, {
        publishedAt: new Date()
    }, { new: true }).then(doc => {
        res.json(doc);
    }).catch(err => {
        res.json(err);
    });

});

// Eliminar
app.delete('/cursos/:id', (req, res) => {
    //forma 1 - Elimiar de 0 a N documentos
    // Elimina tantos como cumplan la condición
    // Course.deleteMany({ numberOfTopics: 0 }).then(doc => {
    //     res.json(doc);
    // }).catch(err => {
    //     res.json(err);
    // });

    // forma 2 - Eliminación por id
    Course.findByIdAndDelete(req.params.id).then(doc => {
        res.json(doc);
    }).catch(err => {
        res.json(err);
    });
});


// operaciones con el modelo (colección) video
// Insert
app.post('/videos', (req, res) => {
    // se crea una colección llamada video y su documento respectivo
    Video.create({
            title: 'Primer video',
            course: '5ed44a622a3b2d6b17b07561',
            tags: [{ // dando valores al subconjunto
                    title: 'Ruby'
                },
                {
                    title: 'web'
                }
            ]
        }).then(video => {
            return Course.findById('5ed44a622a3b2d6b17b07561')
                .then(course => {
                    course.videos.push(video.id);
                    return course.save();
                });
        })
        .then(response => {
            res.json(response); // si se crea bien se manda por json
        }).catch(err => {
            console.log(err);
            res.json(err); // si hay un error lo retorna y en formato json
        });
});

// usando pupulate
/* POPLATE: trae el documento del modelo asociado y lo muestra - va antes de la promesa (despues de la operación)
    trae toda la información del modelo al que está haciendo referencia
*/
app.get('/videos', (req, res) => {
    // se crea una colección llamada video y su documento respectivo
    Video.find().populate('course') // referencia al modelo
        .then(response => {
            res.json(response); // si se crea bien se manda por json
        }).catch(err => {
            console.log(err);
            res.json(err); // si hay un error lo retorna y en formato json
        });
});

// actualizar un sibdoumento
app.put('/videos/:id', (req, res) => {
    // se crea una colección llamada video y su documento respectivo
    let video = Video.findById(req.params.id) // referencia al modelo
        .then(video => {
            video.tags[0] = { title: 'Ruby v2' },
                video.tags[1] = { title: 'Web v2' }
            return video.save()
        })
        .then(response => {
            res.json(response); // si se crea bien se manda por json
        }).catch(err => {
            console.log(err);
            res.json(err); // si hay un error lo retorna y en formato json
        });
});

// eliminar un subconjunto
app.delete('/videos/:id/tags/:tag_id', (req, res) => {
    // se crea una colección llamada video y su documento respectivo
    let video = Video.findById(req.params.id) // referencia al modelo
        .then(video => {
            const tag = video.tags.id(req.params.tag_id).remove(); //forma 1
            //video.tags.pull(req.params.tag_id) // forma 2

            return video.save()
        })
        .then(response => {
            res.json(response); // si se crea bien se manda por json
        }).catch(err => {
            console.log(err);
            res.json(err); // si hay un error lo retorna y en formato json
        });
});



// definiendo el puerto del servidor
app.listen(8000, () => {
    console.log('Server started');
});