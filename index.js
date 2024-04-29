const express = require('express');
const app = express();
const morgan = require('morgan');

// Define a new token for logging request body
morgan.token('reqBody', (req, res) => JSON.stringify(req.body));

// Configure Morgan middleware to log messages to the console
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqBody'));

// Middleware to parse JSON bodies
app.use(express.json());

// Hardcoded phonebook entries
let phonebookEntries = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }
];

// Route to handle GET requests to the root path
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Route to handle GET requests to "/api/persons"
app.get('/api/persons', (req, res) => {
    res.json(phonebookEntries);
});

// Route to handle GET requests to "/api/persons/:id"
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const entry = phonebookEntries.find(entry => entry.id === id);

    if (entry) {
        res.json(entry);
    } else {
        res.status(404).end();
    }
});

// Route to handle GET requests to "/info"
app.get('/info', (req, res) => {
    // Get the current date and time
    const currentTime = new Date();
    // Get the number of entries in the phonebook
    const numEntries = phonebookEntries.length;
    // Generate the HTML content for the page
    const htmlContent = `
        <div>
            <p>Phonebook has info for ${numEntries} people</p>
            <p>${currentTime}</p>
        </div>
    `;
    // Send the HTML content as the response to the client
    res.send(htmlContent);
});

// Route to handle POST requests to "/api/persons"
app.post('/api/persons', (req, res) => {
    const body = req.body;
    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'Name or number missing' });
    }
    const nameExists = phonebookEntries.some(entry => entry.name === body.name);
    if (nameExists) {
        return res.status(400).json({ error: 'Name must be unique' });
    }
    // Generate a new ID
    const newId = generateUniqueId();
    const newEntry = {
        id: newId,
        name: body.name,
        number: body.number
    };
    phonebookEntries.push(newEntry);
    res.json(newEntry);
});

// Function to generate a unique ID
function generateUniqueId() {
    // Define the range for the random ID
    const min = 100000;
    const max = 999999;
    // Generate a random ID within the range
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Route to handle DELETE requests to "/api/persons/:id"
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const initialLength = phonebookEntries.length;
    phonebookEntries = phonebookEntries.filter(entry => entry.id !== id);

    if (initialLength === phonebookEntries.length) {
        // No entry was deleted
        res.status(404).json({ error: 'Entry not found' });
    } else {
        // Entry was successfully deleted
        res.status(204).end();
    }
});

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)

// Start the server
const PORT = 3001;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

  app.use(requestLogger)

// Close the server when the Node.js process is terminated
process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
