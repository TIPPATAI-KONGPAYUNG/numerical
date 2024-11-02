const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://s6504062616071:art@art.ay4iq.mongodb.net/numerical?retryWrites=true&w=majority&appName=Art')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

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

// Get data by No
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

// Update data by No
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
