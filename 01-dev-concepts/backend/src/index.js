console.clear();
const express = require("express");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());

/**
 * HTTP Methods
 *
 * GET: Used to search informations from backend
 * POST: Used to create a information on backend
 * PUT/PATCH: Used to change some information from backend
 * DELETE: Used to delete some information from backend
 */

/**
 * Params Types
 *
 * Query Params: Filter and Pagination
 * Route Params: Identify resources (update/delete)
 * Request Body: Content to create or edit a resource (JSON)
 */

/**
 * Middleware:
 *
 * Request Interceptorr, can interrupt all requests or change data from request
 */

const projects = [];

// Middleware example
function logRequests(request, response, next) {
  const { method, url } = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`;
  // console.log(logLabel);
  console.time(logLabel);
  next(); //Next middleware
  console.timeEnd(logLabel);
}
function validateProjectId(request, response, next) {
  const { id } = request.params;
  if (!isUuid(id)) {
    return response.status(400).json({ error: "Invalid Project ID" });
  }
  return next();
}

app.use(logRequests);
app.use("/projects:id", validateProjectId);

// Query Params
app.get("/projects", (request, response) => {
  const { title /*,owner*/ } = request.query;

  const results = title
    ? projects.filter((project) => project.title.includes(title))
    : projects;
  // console.log(`Title: ${title}`);
  // console.log(`Owner: ${owner}`);
  return response.json(projects);
});

// Request Body
app.post("/projects", (request, response) => {
  const { title, owner } = request.body;

  const project = { id: uuid(), title, owner };

  projects.push(project);
  return response.json(project);
});

// Route Params
app.put("/projects/:id", (request, response) => {
  const { id } = request.params;
  const { title, owner } = request.body;

  const projectIndex = projects.findIndex((project) => project.id === id);
  if (projectIndex < 0) {
    return response.status(400).json({ error: "Project not found" });
  }

  const project = {
    id,
    title,
    owner,
  };

  projects[projectIndex] = project;

  return response.json([project]);
});

// Route Params
app.delete("/projects/:id", (request, response) => {
  const { id } = request.params;

  const projectIndex = projects.findIndex((project) => project.id === id);

  if (projectIndex < 0) {
    return response.status(400).json({ error: "Project not found" });
  }

  projects.splice(projectIndex, 1);

  return response.status(204).send();
});

// Route to our application
app.listen(3333, () => {
  console.log(`🚀 Backend Started!`);
});
