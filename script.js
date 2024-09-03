const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const day = document.querySelector(".day");
const date = document.querySelector(".date");
const d = new Date();

const today = weekday[d.getDay()];
day.innerHTML = today;

const currentDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
date.innerHTML = currentDate;

const form = document.getElementById("form");
const eventsList = document.querySelector(".list");

const addEventBtn = document.querySelector(".add-task");
const plusIcon = document.querySelector(".plus");
const createBtn = document.querySelector(".add-event-btn");
const updateBtn = document.querySelector(".update-event-btn");

let taskToDelete = null; // To keep track of which task to delete
let currentEditId = null;
let events = []; // Keep track of all events

// Load events from localStorage on page load
const loadEvents = () => {
  events = JSON.parse(localStorage.getItem("events")) || [];
  events.forEach((event) => createEvent(event));
};

// Save events to localStorage
const saveEvents = () => {
  localStorage.setItem("events", JSON.stringify(events));
};

// Toggle form visibility and button states
const toggleForm = (isEditing) => {
  form.classList.toggle("active");
  plusIcon.classList.toggle("rotate");
  createBtn.classList.toggle("active", !isEditing);
  updateBtn.classList.toggle("active", isEditing);
  if (!isEditing) {
    form.reset();
  }
};

// Event listener on Add new task button
addEventBtn.addEventListener("click", () => toggleForm(false));

// Form submit handler
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const event = {};
  formData.forEach((value, key) => {
    event[key === "due-date" ? "dueDate" : key] = value;
  });

  if (currentEditId) {
    // Editing an existing event
    event.id = currentEditId;
    events = events.map((e) => (e.id === currentEditId ? event : e)); // Update event
    updateEventInDOM(event);
    currentEditId = null; // Reset after editing
  } else {
    // Creating a new event
    event.id = createId(); // Add unique ID to the event
    events.push(event);
    createEvent(event);
  }

  saveEvents(); // Save all events to localStorage

  form.reset(); // Clear the form
  toggleForm(false);
});

// Create unique ID
const createId = () => Math.round(Math.random() * 1000000);

// Create and append a new event to the list
const createEvent = ({ id, title, description, dueDate }) => {
  const newEvent = document.createElement("li");
  newEvent.classList.add("list-item");

  newEvent.innerHTML = `
        <input class="checkbox" type="checkbox" id="${id}" />
        <label for="${id}" class="btn"></label>
        <svg class="check">
          <polyline points="1,7 6,11 14,3" />
        </svg>
        <div class="task-details">
          <label for="${id}" class="text"><b>Title:</b> ${title}</label>
          <p class="description"><b>Description:</b> ${description}</p>
          <span class="due-date"><b>Due Date:</b> ${dueDate}</span>
        </div>
        <div class="action-btns">
          <button class="edit"><i class="fa-regular fa-pen-to-square"></i></button>
          <button class="delete"><i class="fa-solid fa-trash"></i></button>
        </div>`;

  eventsList.appendChild(newEvent);
  addEventListeners(newEvent); // Add event listeners to the new event element
};

// Update event in the DOM after editing
const updateEventInDOM = ({ id, title, description, dueDate }) => {
  const listItem = document.getElementById(id).closest(".list-item");
  listItem.querySelector(".text").innerHTML = `<b>Title:</b> ${title}`;
  listItem.querySelector(
    ".description"
  ).innerHTML = `<b>Description:</b> ${description}`;
  listItem.querySelector(".due-date").innerHTML = `<b>Due Date:</b> ${dueDate}`;
};

// Select the confirmation box elements
const confirmBox = document.querySelector(".confirm-box");
const confirmYesBtn = confirmBox.querySelector(
  ".confirm-btns button:first-child"
);
const confirmNoBtn = confirmBox.querySelector(
  ".confirm-btns button:last-child"
);

let listItemToDelete = null; // To store the item to delete

// Handle delete confirmation
const handleDelete = (e) => {
  e.stopPropagation();
  listItemToDelete = e.target.closest(".list-item");
  confirmBox.classList.add("active"); // Show confirmation box
};

// Confirm deletion
confirmYesBtn.addEventListener("click", () => {
  if (listItemToDelete) {
    const id = listItemToDelete.querySelector(".checkbox").id;

    // Remove event from the array and update localStorage
    events = events.filter((event) => event.id !== id);
    saveEvents();

    // Remove the event from the DOM
    listItemToDelete.remove();
  }
  confirmBox.classList.remove("active"); // Hide confirmation box
  listItemToDelete = null;
});

// Cancel deletion
confirmNoBtn.addEventListener("click", () => {
  confirmBox.classList.remove("active"); // Hide confirmation box
  listItemToDelete = null;
});

// Edit an event
const editEvent = (e) => {
  const listItem = e.target.closest(".list-item");
  currentEditId = listItem.querySelector(".checkbox").id;

  const title = listItem
    .querySelector(".text")
    .textContent.replace("Title:", "")
    .trim();
  const description = listItem
    .querySelector(".description")
    .textContent.replace("Description:", "")
    .trim();
  const dueDate = listItem
    .querySelector(".due-date")
    .textContent.replace("Due Date:", "")
    .trim();

  const formattedDueDate = new Date(dueDate).toISOString().split("T")[0];

  // Populate the form fields with existing data
  form.querySelector("#title").value = title;
  form.querySelector("#description").value = description;
  form.querySelector("#due-date").value = formattedDueDate;

  toggleForm(true);
};

// Add event listeners to newly created elements
const addEventListeners = (element) => {
  const editBtn = element.querySelector(".edit");
  const deleteBtn = element.querySelector(".delete");

  editBtn.addEventListener("click", editEvent);
  deleteBtn.addEventListener("click", handleDelete);
};

// Initialize by loading events and setting up event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadEvents();
});
