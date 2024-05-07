import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import Jimp from 'jimp';

const app = express();

const __dirname = path.resolve();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/saveImage', async (req, res) => {
    const { imageUrl } = req.body;

    try {
        const image = await Jimp.read(imageUrl);
        image.resize(500, 500);
        // image.resize(350, Jimp.AUTO);
        image.quality(60);
        image.greyscale();

        const imageName = `${nanoid(6)}.jpeg`;
        const pathFile = path.join(__dirname, 'public', 'assets', 'img', imageName);
        await image.writeAsync(pathFile);

        const imagePath = path.relative(__dirname, pathFile);
        console.log('Imagen guardada correctamente en:', imagePath);

        // Ruta de la última imagen guardada
        const latestImagePath = `/assets/img/${imageName}`;

        // Ruta del archivo HTML
        const htmlFilePath = path.join(__dirname, 'public', 'imagen_guardada.html');

        // Leer el contenido del archivo HTML
        fs.readFile(htmlFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error al leer el archivo HTML:', err);
                return res.status(500).send('Error interno del servidor');
            }

            // Reemplazar la ruta de la imagen en el HTML con la ruta de la última imagen guardada
            const htmlWithImage = data.replace('/assets/img/${path.basename(pathFile)}', latestImagePath);

            // Enviar el HTML modificado como respuesta al cliente
            res.send(htmlWithImage);
        });

    } catch (error) {

        console.error('Error al procesar la imagen:', error);
        res.status(500).json({ error: 'Error al procesar la imagen' });

    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Aplicación de ejemplo escuchando en el puerto ${PORT}`);
});

