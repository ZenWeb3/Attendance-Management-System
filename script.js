// Get elements
const userList = document.getElementById("userList");
const attendanceSummary = document.getElementById("attendanceSummary");
const nameInput = document.getElementById("nameInput");
const employeeList = document.getElementById("employeeList"); // For employee names/photos
let myChart; // For overall attendance chart
let detailChart; // For individual employee chart

// Array to hold users and their attendance records
let users = [];

// Add User Function
function addUser() {
  const name = nameInput.value.trim();
  if (name) {
    // Check if user already exists
    if (users.some((user) => user.name === name)) {
      alert("Employee already exists.");
      return;
    }

    // Add new user with default photo (can update later for actual photo input)
    users.push({ 
      name, 
      photo: "https://img.freepik.com/free-psd/3d-render-avatar-character_23-2150611719.jpg", // Placeholder for user photo
      attendance: [] 
    });

    // Add new user to the dropdown
    const option = document.createElement("option");
    option.value = users.length - 1; // Use index as value to simplify access
    option.text = name;
    userList.appendChild(option);

    // Update the employee list dynamically
    updateEmployeeList();

    nameInput.value = ""; // Clear the input field
    saveData(); // Save data to localStorage
    updateChart(); // Update chart after adding user
  } else {
    alert("Please enter a valid name.");
  }
}

// Update Employee List Function
function updateEmployeeList() {
  employeeList.innerHTML = ""; // Clear current list

  users.forEach((user, index) => {
    const employeeDiv = document.createElement("div");
    employeeDiv.className = "employee-item";
    employeeDiv.onclick = () => showEmployeeDetails(index); // Attach click handler

    const employeePhoto = document.createElement("img");
    employeePhoto.src = user.photo; // Use the default photo or replace with actual photo
    employeePhoto.alt = `${user.name}'s Photo`;
    employeePhoto.className = "employee-photo";

    const employeeName = document.createElement("p");
    employeeName.textContent = user.name;
    employeeName.className = "employee-name";

    employeeDiv.appendChild(employeePhoto);
    employeeDiv.appendChild(employeeName);

    employeeList.appendChild(employeeDiv); // Add to the employee list section
  });
}

// Mark Attendance Function
function markAttendance(status) {
  const selectedIndex = userList.value;
  if (selectedIndex !== "Select Employee") {
    const user = users[selectedIndex];
    const date = new Date().toLocaleDateString();

    // Check if attendance is already marked for the same date
    const alreadyMarked = user.attendance.some(
      (record) => record.date === date
    );
    if (alreadyMarked) {
      alert("Attendance already marked for today.");
      return;
    }

    // Add attendance record
    user.attendance.push({ date, status });

    // Display Attendance in the Summary
    const li = document.createElement("li");
    li.textContent = `${user.name} was ${status} on ${date}`;
    li.className = status;
    attendanceSummary.appendChild(li);

    // Save data and update chart
    saveData();
    updateChart();
  } else {
    alert("Please select an Employee.");
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
}

// Load data from localStorage
function loadData() {
  const storedUsers = localStorage.getItem("users");
  if (storedUsers) {
    users = JSON.parse(storedUsers);
    
    // Update the dropdown and the employee list
    users.forEach((user, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.text = user.name;
      userList.appendChild(option);

      // Display past attendance records
      user.attendance.forEach((record) => {
        const li = document.createElement("li");
        li.textContent = `${user.name} was ${record.status} on ${record.date}`;
        li.className = record.status;
        attendanceSummary.appendChild(li);
      });
    });

    // Update the employee list on the dashboard
    updateEmployeeList();
    
    // Update the general attendance chart with loaded data
    updateChart();
  }
}

// Function to update the general attendance chart
function updateChart() {
  const presentCount = users.reduce((count, user) => {
    return (
      count +
      user.attendance.filter((record) => record.status === "present").length
    );
  }, 0);

  const absentCount = users.reduce((count, user) => {
    return (
      count +
      user.attendance.filter((record) => record.status === "absent").length
    );
  }, 0);

  const ctx = document.getElementById("attendanceChart").getContext("2d");

  if (myChart) {
    myChart.destroy(); // Destroy previous chart instance
  }

  // Create a new doughnut chart
  myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Present", "Absent"],
      datasets: [
        {
          label: "Attendance Progress",
          data: [presentCount, absentCount],
          backgroundColor: ["#28a745", "#dc3545"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
      },
    },
  });
}

// Show Employee Details
function showEmployeeDetails(index) {
  const employee = users[index];
  
  // Set employee details in the detail section
  document.getElementById("employeeName").textContent = employee.name;
  document.getElementById("employeePhoto").src = employee.photo;

  // Generate employee's attendance chart
  const presentCount = employee.attendance.filter(a => a.status === 'present').length;
  const absentCount = employee.attendance.filter(a => a.status === 'absent').length;

  if (detailChart) {
    detailChart.destroy(); // Destroy the previous chart
  }

  const ctx = document.getElementById("employeeAttendanceChart").getContext("2d");
  detailChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Present", "Absent"],
      datasets: [{
        label: `${employee.name}'s Weekly Attendance`,
        data: [presentCount, absentCount],
        backgroundColor: ["#28a745", "#dc3545"],
      }]
    }
  });

  // Hide employee list, show employee detail section
  document.getElementById("employeeListSection").style.display = "none";
  document.getElementById("employeeDetailSection").style.display = "block";
}

// Back to Employee List Function
function backToList() {
  document.getElementById("employeeDetailSection").style.display = "none";
  document.getElementById("employeeListSection").style.display = "block";
}

// Call loadData when the page loads
window.onload = loadData;
