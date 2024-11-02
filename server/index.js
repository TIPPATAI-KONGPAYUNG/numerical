const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://s6504062616071:art@art.ay4iq.mongodb.net/numerical?retryWrites=true&w=majority&appName=Art')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Swagger options
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Numerical API",
            version: "1.0.0",
            description: "API documentation for the Numerical project",
        },
        servers: [
            {
                url: "http://localhost:3001", 
            },
        ],
    },
    apis: ["./index.js"], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Define schema and model for the numerical data
const numSchema = new mongoose.Schema({
    no: { type: Number, required: true, unique: true },
    equation: String,
    xl: String,
    xr: String,
    x: String,
    n: String,
    m: String,
    a: String,
    b: String
}, { collection: 'test' });

const Num = mongoose.model('Num', numSchema);

/**
 * @swagger
 * /{no}:
 *   get:
 *     summary: Get data by No
 *     parameters:
 *       - name: no
 *         in: path
 *         required: true
 *         description: The number to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single record
 *       404:
 *         description: No record found
 */

app.get('/:no', async (req, res) => {
    try {
        const no = parseInt(req.params.no, 10);
        const result = await Num.findOne({ no: no });
        if (!result) {
            return res.status(404).json({ error: "No record found" });
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data" });
    }
});

/**
 * @swagger
 * /update/{no}:
 *   put:
 *     summary: Update data by No
 *     parameters:
 *       - name: no
 *         in: path
 *         required: true
 *         description: The number to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               equation:
 *                 type: string
 *               xl:
 *                 type: string
 *               xr:
 *                 type: string
 *               x:
 *                 type: string
 *               n:
 *                 type: string
 *               m:
 *                 type: string
 *               a:
 *                 type: string
 *               b:
 *                 type: string
 *     responses:
 *       200:
 *         description: Data updated successfully                                                                         
 *       404:
 *         description: No record found to update
 */

app.put('/update/:no', async (req, res) => {
    try {
        const no = parseInt(req.params.no, 10);
        const { equation, xl, xr, x, n, m, a, b, xin } = req.body;
        
        const result = await Num.updateOne(
            { no: no },
            { $set: { equation, xl, xr, x, n, m, a, b, xin } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "No record found to update" });
        }
        res.json({ message: "Data updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error updating data" });
    }
});

// Start the server
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
