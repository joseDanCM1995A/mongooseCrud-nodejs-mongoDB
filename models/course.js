// importar mongosee
const mongoose = require('mongoose');
const slugify = require('slugify');

// definir el esquema
let courseEsquema = new mongoose.Schema({
    title: {
        // validaciones
        type: String,
        required: true,
        // todas las validaciones tienen un segundo parámetro
        // y es un msj que retorna en dado caso de que no se cumpla
        minlength: [4, "No se cumple la longitud mínima de 4"],
        maxlength: 30,
        // mensajes personalizados de la validación
        // validate: {
        //     validator: function(value) {
        //         //se pueden hacer promesas
        //         return new Promise((res, rej) => {
        //             res(false);
        //         });
        //     },
        //     message: (props) => `EL valor: ${props.value} no fue valido por x razón`
        // } es mejor usar validaciones ya testeadas

        //
    },
    // otra manera - para dar mas valores
    description: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 200
    },
    numberOfTopics: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    publishedAt: Date,
    slug: {
        type: String,
        required: true
    },
    videos: [{ // para hacer referencia al modelo con el que estará ligado
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video' // haciendo referencia al modelo 
    }]

});

// definiendo un virtual (campo que no esta en la bd, nosotros lo hacemos)

courseEsquema.virtual('info')
    .get(() => {
        return `${this.description}. Temas ${this.numberOfTopics}. Fecha de lanzamiento. ${this.publishedAt}`;
    });

// definiendo un middleware : es como un trigger
/*
validate
save
remove
update
deleteOne
init => sync*/

courseEsquema.pre('validate', function(next) {
    this.slug = slugify(this.title);
    next();
});

// definir el modelo
mongoose.model('Course', courseEsquema);

console.log("ok");