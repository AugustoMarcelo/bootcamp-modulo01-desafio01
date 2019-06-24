const express = require('express');

const server = express();

server.use(express.json());

const projects = [];

let requestsCount = 0;

// Global middeware to count requests
server.use((request, response, next) => {
    requestsCount += 1;
    console.log(`Requests: ${requestsCount}`);
    next();
});

// Middleware who checks if the project exists and return your index or -1, if not found
function checkIfProjectExists(request, response, next) {
    if (projects.length == 0) return response.status(400).json({ error: "No projects found" });

    let index;

    projects.forEach((project, position) => {
        if (project.id == request.params.id) index = position;
    });
    
    if (index > -1) {
        request.projectIndex = index;
        return next();
    }

    return response.status(400).json({ error: "Project doesn't exists" });
}

// Route to return all projects
server.get('/projects', (request, response) => {
    return response.json(projects);
});

// Route to add a new project
server.post('/projects', (request, response) => {
    const { id, title, tasks } = request.body;
    projects.push({
        id,
        title,
        tasks
    });
    return response.json(projects);
});

// Route to update a project
server.put('/projects/:id', checkIfProjectExists, (request, response) => {
    projects[request.projectIndex].title = request.body.title;
    return response.json(projects[request.projectIndex]);
});

// Route to delete a project
server.delete('/projects/:id', checkIfProjectExists, (request, response) => {
    projects.splice(request.projectIndex, 1);
    response.send();
});

// Route to add a new task for a project
server.post('/projects/:id/tasks', checkIfProjectExists, (request, response) => {
    projects[request.projectIndex].tasks.push(request.body.title);
    response.json(projects[request.projectIndex]);
});

server.listen(3000);