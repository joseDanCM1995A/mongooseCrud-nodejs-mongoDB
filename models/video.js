const mongoose = require('mongoose');

let videoSchema = new mongoose.Schema({
    title: String,
    // hacer referencia a un curso
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', // nombre del modelo al que hace referencia
        required: true
    },
    tags: [
        new mongoose.Schema({ // definiendo un subdocumento (documento dentro de un documento)
            title: {
                type: String,
                required: true
            }
        })
    ]

});

mongoose.model('Video', videoSchema);