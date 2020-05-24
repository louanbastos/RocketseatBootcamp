console.clear();
const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");
var mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

// Middlaware for all log requests
function logRequests(request, response, next) {
  // Variable to get the used method and the requested url
  const { method, url } = request;

  // Variable to show on console the method and url requested
  const logLabel = `[${method.toUpperCase()}] - ${url}`;
  // starts to count the time
  console.time(logLabel);

  // go to the next middleware
  next();

  // ends to count the time and show on console
  console.timeEnd(logLabel);
}

// Validade the repository id
function validateRepositoryId(request, response, next) {
  const { id } = request.params;
  if (!isUuid(id)) {
    return response.status(400).json({ error: "Invalid Project ID" });
  }
  return next();
}

// Call the function (middleware) logRequests
app.use(logRequests);

// Call the function to validade the repository id
app.use("/repositories:id", validateRepositoryId);

// Get a list with all repositories
app.get("/repositories", (request, response) => {
  const { title, url, techs, likes } = request.query;
  return response.json(repositories);
});

// Create a new repository
app.post("/repositories", (request, response) => {
  const { title, url, techs = [], likes } = request.body;
  const repository = { id: uuid(), title, url, techs, likes: 0 };
  repositories.push(repository);
  return response.json(repository);
});

// Edit a repository by id
app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const repository = repositories.find((repository) => repository.id === id);
  if (!repository) {
    return response.status(400).json({ error: "Repository not found!" });
  }
  repository.title = title;
  repository.url = url;
  repository.techs = techs;

  return response.json(repository);
});

// Delete the repository by id
app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repository = repositories.findIndex(
    (repository) => repository.id === id
  );

  if (repository < 0) {
    return response.status(400).json({ error: "Repository not found" });
  }

  repositories.splice(repository, 1);

  return response.status(204).send();
});

// Update the likes incrementing by +1 every each request
app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repository = repositories.find((repository) => repository.id === id);

  if (!repository) {
    return response.status(400).json({ error: "Repository not found!" });
  }

  repository.likes += 1;

  return response.json(repository);
});

module.exports = app;
