const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const marklogic = require("marklogic");
const xml2js = require('xml2js');
const app = express();

// Configure MarkLogic client
const db = marklogic.createDatabaseClient({
    user: "9c5tu",
    password: "tushar",
    host: "localhost",
    port: "8000",
    authType: "digest", // Adjust as per your MarkLogic authentication type
    database: "Documents", // Adjust as per your MarkLogic database name
});

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => res.send("Hello World!"));

// Function to convert XML to JSON
function xmlToJson(xml) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, { explicitArray: false, trim: true, mergeAttrs: true }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.task);
            }
        });
    });
}

// Get all task
app.get('/tasks', (req, res) => {
    db.documents.query(
        marklogic.queryBuilder.where(
            marklogic.queryBuilder.collection('tasks')
        )
    ).result()
        .then(documents => {
            const xmlDocuments = documents.map(doc => doc.content);
            const jsonPromises = xmlDocuments.map(xmlToJson);
            return Promise.all(jsonPromises);
        })
        .then(tasks => {
            res.json(tasks);
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
            res.status(500).send('Error fetching tasks');
        });
});

// Add Task
app.post('/tasks', (req, res) => {
    const newTask = req.body; // Assuming req.body contains { id: 'TaskID', name: 'Task Name' }
    const uri = '/tasks/' + newTask.id + '.xml'; // Example URI

    const xmlTask = `
        <task>
            <id>${newTask.id}</id>
            <name>${newTask.name}</name>
            <completed>false</completed>
        </task>
    `;

    db.documents.write({
        uri: uri,
        collections: ['tasks'],
        contentType: 'application/xml',
        content: xmlTask
    }).result()
        .then(() => {
            res.send(newTask);
        })
        .catch(error => {
            console.error('Error creating task:', error);
            res.status(500).send('Error creating task');
        });
});

// Delete task
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;

    db.documents.remove('/tasks/' + taskId + '.xml')
        .result()
        .then(() => {
            res.send({ message: 'Task deleted successfully' });
        })
        .catch(error => {
            console.error('Error deleting task:', error);
            res.status(500).send('Error deleting task');
        });
});

// Mark task as complete
app.put('/tasks/:taskId/complete', (req, res) => {
    const taskId = req.params.taskId;

    db.documents.read('/tasks/' + taskId + '.xml')
        .result()
        .then(document => {
            let task = document[0].content;
            const taskRegex = new RegExp(`(<completed>)(false|true)(<\\/completed>)`);
            task = task.replace(taskRegex, '$1true$3');

            return db.documents.write({
                uri: '/tasks/' + taskId + '.xml',
                collections: ['tasks'],
                contentType: 'application/xml',
                content: task
            }).result();
        })
        .then(() => {
            res.send({ message: 'Task marked as complete' });
        })
        .catch(error => {
            console.error('Error marking task as complete:', error);
            res.status(500).send('Error marking task as complete');
        });
});

// Unmark task as complete
app.put('/tasks/:taskId/uncomplete', (req, res) => {
    const taskId = req.params.taskId;

    db.documents.read('/tasks/' + taskId + '.xml')
        .result()
        .then(document => {
            let task = document[0].content;
            const taskRegex = new RegExp(`(<completed>)(false|true)(<\\/completed>)`);
            task = task.replace(taskRegex, '$1false$3');

            return db.documents.write({
                uri: '/tasks/' + taskId + '.xml',
                collections: ['tasks'],
                contentType: 'application/xml',
                content: task
            }).result();
        })
        .then(() => {
            res.send({ message: 'Task unmarked as complete' });
        })
        .catch(error => {
            console.error('Error marking task as incomplete:', error);
            res.status(500).send('Error marking task as incomplete');
        });
});


const port = process.env.BACKEND_PORT || 3001;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
