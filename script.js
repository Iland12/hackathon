// ============================================
// CIVICSENSE AI - FRONTEND JAVASCRIPT
// ============================================

const API_URL = "http://localhost:3000/api";

// ========== COMPLAINT SUBMISSION ==========
async function submitComplaint() {
  const text = document.getElementById("complaintText").value;
  const location = document.getElementById("location").value;
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;

  if (!text || !location || !name || !phone) {
    alert("Please fill all required fields");
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Processing & Sending Emails...';
  submitBtn.disabled = true;

  try {
    const complaintData = {
      text: text,
      location: location,
      name: name,
      phone: phone,
      email: email || null,
    };

    const response = await fetch(`${API_URL}/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(complaintData),
    });

    const result = await response.json();

    if (result.success) {
      showAIResult(result);
    } else {
      alert("Error: " + (result.error || "Failed to submit"));
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Connection error. Please check if backend is running.");
  } finally {
    submitBtn.innerHTML =
      '<i class="fas fa-paper-plane"></i> Submit Complaint & Send Email';
    submitBtn.disabled = false;
  }
}

function showAIResult(result) {
  document.getElementById("complaintForm").style.display = "none";
  const aiResult = document.getElementById("aiResult");
  aiResult.style.display = "block";

  // Update result display
  document.getElementById("resultCategory").textContent =
    result.aiAnalysis.category;
  document.getElementById(
    "resultPriority"
  ).textContent = `Level ${result.aiAnalysis.priority}/5`;
  document.getElementById("resultDept").textContent =
    result.aiAnalysis.department;
  document.getElementById("complaintId").textContent = result.complaintId;

  // Email status
  const emailStatus = document.getElementById("emailStatus");
  if (result.emailSent.adminSent) {
    emailStatus.innerHTML =
      '<i class="fas fa-check-circle"></i> Admin notified';
    emailStatus.style.color = "#10b981";
  }

  // Show citizen email status if email was provided
  if (result.data.citizen.email && result.emailSent.citizenSent) {
    const citizenEmail = document.createElement("div");
    citizenEmail.innerHTML =
      '<i class="fas fa-check-circle"></i> Confirmation sent to citizen';
    citizenEmail.style.color = "#10b981";
    citizenEmail.style.marginTop = "5px";
    emailStatus.appendChild(citizenEmail);
  }

  // Update timeline
  updateTimeline();
}

function updateTimeline() {
  const now = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  document.querySelectorAll(".timeline-step p")[2].textContent = now;
}

function resetForm() {
  document.getElementById("complaintForm").reset();
  document.getElementById("charCount").textContent = "0";
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude.toFixed(4);
      const lon = position.coords.longitude.toFixed(4);
      document.getElementById("location").value = `Lat: ${lat}, Lon: ${lon}`;
    });
  } else {
    alert("Geolocation not supported");
  }
}

// Character counter
document
  .getElementById("complaintText")
  ?.addEventListener("input", function () {
    document.getElementById("charCount").textContent = this.value.length;
  });

// ========== TRACK COMPLAINT ==========
async function trackComplaint() {
  const complaintId = document.getElementById("trackId").value.trim();

  if (!complaintId) {
    alert("Please enter a Complaint ID");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/complaints/${complaintId}`);
    const result = await response.json();

    if (result.success) {
      displayComplaintStatus(result.data);
    } else {
      showNotFound();
    }
  } catch (error) {
    console.error("Error:", error);
    showNotFound();
  }
}

function displayComplaintStatus(complaint) {
  const resultDiv = document.getElementById("trackingResult");

  let statusClass = "";
  let statusIcon = "";
  let statusText = "";

  switch (complaint.status) {
    case "resolved":
      statusClass = "resolved";
      statusIcon = "fa-check-circle";
      statusText = "Resolved";
      break;
    case "in-progress":
      statusClass = "progress";
      statusIcon = "fa-tools";
      statusText = "In Progress";
      break;
    default:
      statusClass = "pending";
      statusIcon = "fa-clock";
      statusText = "Pending";
  }

  resultDiv.innerHTML = `
        <div class="status-card ${statusClass}">
            <div class="status-header">
                <i class="fas ${statusIcon}"></i>
                <h3>Status: ${statusText}</h3>
                <span class="complaint-id">${complaint.id}</span>
            </div>
            
            <div class="status-details">
                <div class="detail-row">
                    <span class="label">Issue:</span>
                    <span class="value">${complaint.text}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Category:</span>
                    <span class="value">${complaint.category}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Priority:</span>
                    <span class="value priority-${complaint.priority}">Level ${
    complaint.priority
  }/5</span>
                </div>
                <div class="detail-row">
                    <span class="label">Department:</span>
                    <span class="value">${complaint.department}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Location:</span>
                    <span class="value">${complaint.location}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Submitted:</span>
                    <span class="value">${new Date(
                      complaint.date
                    ).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Email Status:</span>
                    <span class="value email-sent">
                        <i class="fas fa-check-circle"></i> Sent to Admin
                        ${
                          complaint.citizen.email
                            ? '<br><i class="fas fa-check-circle"></i> Confirmation to Citizen'
                            : ""
                        }
                    </span>
                </div>
            </div>
            
            <div class="status-timeline">
                <h4><i class="fas fa-history"></i> Timeline</h4>
                <div class="timeline">
                    <div class="timeline-step completed">
                        <div class="step-dot"></div>
                        <div class="step-content">
                            <strong>Submitted</strong>
                            <p>${new Date(
                              complaint.date
                            ).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="timeline-step ${
                      complaint.status !== "pending" ? "completed" : "active"
                    }">
                        <div class="step-dot"></div>
                        <div class="step-content">
                            <strong>AI Analysis</strong>
                            <p>Category: ${complaint.category}</p>
                        </div>
                    </div>
                    <div class="timeline-step ${
                      complaint.status === "in-progress" ||
                      complaint.status === "resolved"
                        ? "completed"
                        : ""
                    }">
                        <div class="step-dot"></div>
                        <div class="step-content">
                            <strong>Department Assigned</strong>
                            <p>${complaint.department}</p>
                        </div>
                    </div>
                    <div class="timeline-step ${
                      complaint.status === "resolved" ? "completed" : ""
                    }">
                        <div class="step-dot"></div>
                        <div class="step-content">
                            <strong>Resolution</strong>
                            <p>${
                              complaint.status === "resolved"
                                ? "Completed"
                                : "In progress"
                            }</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="status-actions">
                <button class="btn-primary" onclick="goHome()">
                    <i class="fas fa-home"></i> Home
                </button>
                <button class="btn-secondary" onclick="submitNewComplaint()">
                    <i class="fas fa-plus"></i> Submit Another
                </button>
            </div>
        </div>
    `;
}

function showNotFound() {
  document.getElementById("trackingResult").innerHTML = `
        <div class="not-found">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Complaint Not Found</h3>
            <p>Please check the ID and try again</p>
        </div>
    `;
}

function loadDemo(complaintId) {
  document.getElementById("trackId").value = complaintId;
  trackComplaint();
}

// ========== DASHBOARD ==========
async function loadDashboard() {
  try {
    const [complaintsRes, statsRes] = await Promise.all([
      fetch(`${API_URL}/complaints`),
      fetch(`${API_URL}/stats`),
    ]);

    const complaints = await complaintsRes.json();
    const stats = await statsRes.json();

    if (complaints.success && stats.success) {
      updateDashboard(complaints.data, stats.data);
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
}

function updateDashboard(complaints, stats) {
  // Update stats
  document.getElementById("totalComplaints").textContent = stats.total;
  document.getElementById("resolvedCount").textContent = stats.resolved;
  document.getElementById("pendingCount").textContent = stats.pending;
  document.getElementById("emailCount").textContent = stats.total * 2; // Estimate

  // Update complaints table
  const tableBody = document.getElementById("complaintsTable");
  tableBody.innerHTML = "";

  complaints.slice(0, 10).forEach((complaint) => {
    const row = document.createElement("tr");

    let statusBadge = "";
    switch (complaint.status) {
      case "resolved":
        statusBadge = '<span class="badge resolved">Resolved</span>';
        break;
      case "in-progress":
        statusBadge = '<span class="badge progress">In Progress</span>';
        break;
      default:
        statusBadge = '<span class="badge pending">Pending</span>';
    }

    row.innerHTML = `
            <td>${complaint.id}</td>
            <td>${complaint.text.substring(0, 50)}...</td>
            <td>${complaint.category}</td>
            <td><span class="priority-${complaint.priority}">${
      complaint.priority
    }/5</span></td>
            <td>${statusBadge}</td>
            <td><i class="fas fa-check-circle email-check"></i></td>
            <td>
                <button class="btn-small" onclick="viewComplaint('${
                  complaint.id
                }')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  // Update charts
  updateCharts(complaints);
}

function updateCharts(complaints) {
  // Category chart
  const categories = {};
  complaints.forEach((c) => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });

  let categoryChartHTML = "";
  Object.entries(categories).forEach(([cat, count]) => {
    const width = (count / complaints.length) * 100;
    categoryChartHTML += `
            <div class="chart-bar">
                <div class="bar-label">${cat}</div>
                <div class="bar" style="width: ${width}%; background: ${getCategoryColor(
      cat
    )};"></div>
                <div class="bar-value">${count}</div>
            </div>
        `;
  });
  document.getElementById("categoryChart").innerHTML = categoryChartHTML;
}

function getCategoryColor(category) {
  const colors = {
    Water: "#3b82f6",
    Electricity: "#f59e0b",
    Roads: "#ef4444",
    Sanitation: "#10b981",
    Healthcare: "#8b5cf6",
    Education: "#ec4899",
  };
  return colors[category] || "#64748b";
}

// ========== EMAIL TESTING ==========
function testEmailSystem() {
  document.getElementById("emailModal").style.display = "block";
}

function closeModal() {
  document.getElementById("emailModal").style.display = "none";
}

async function sendTestEmail() {
  try {
    const response = await fetch(`${API_URL}/test-email`);
    const result = await response.json();

    if (result.success) {
      alert("✅ Test email sent successfully! Check your inbox.");
    } else {
      alert("⚠️ Email test failed: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error:", error);
    alert("⚠️ Could not connect to server");
  }
  closeModal();
}

// ========== NAVIGATION ==========
function goHome() {
  window.location.href = "index.html";
}

function goToTrack() {
  window.location.href = "track.html";
}

function submitNewComplaint() {
  window.location.href = "submit.html";
}

function viewComplaint(id) {
  window.location.href = `track.html?id=${id}`;
}

// ========== VOICE RECORDING ==========
let mediaRecorder;
let audioChunks = [];

async function startRecording() {
  const recordBtn = document.getElementById("recordBtn");
  const voiceStatus = document.getElementById("voiceStatus");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      // In a real app, you would send this to a speech-to-text API
      voiceStatus.innerHTML =
        '<i class="fas fa-check-circle"></i> Voice recorded (simulated)';
      voiceStatus.style.color = "#10b981";

      // Simulate transcription
      setTimeout(() => {
        document.getElementById("complaintText").value +=
          "\n[Voice recorded and transcribed]";
      }, 1000);
    };

    mediaRecorder.start();
    recordBtn.innerHTML = '<i class="fas fa-stop-circle"></i> Stop Recording';
    recordBtn.onclick = stopRecording;
    voiceStatus.innerHTML =
      '<i class="fas fa-microphone"></i> Recording... Speak now';
    voiceStatus.style.color = "#ef4444";
  } catch (error) {
    console.error("Error accessing microphone:", error);
    voiceStatus.innerHTML =
      '<i class="fas fa-exclamation-triangle"></i> Microphone access denied';
    voiceStatus.style.color = "#f59e0b";
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    const recordBtn = document.getElementById("recordBtn");
    recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record Voice';
    recordBtn.onclick = startRecording;
  }
}

// ========== INITIALIZE ==========
document.addEventListener("DOMContentLoaded", function () {
  // Update character counter
  const complaintText = document.getElementById("complaintText");
  if (complaintText) {
    complaintText.addEventListener("input", function () {
      document.getElementById("charCount").textContent = this.value.length;
    });
  }

  // Load dashboard if on dashboard page
  if (window.location.pathname.includes("dashboard.html")) {
    loadDashboard();
    setInterval(loadDashboard, 30000); // Refresh every 30 seconds
  }

  // Auto-fill demo complaint ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const complaintId = urlParams.get("id");
  if (complaintId && document.getElementById("trackId")) {
    document.getElementById("trackId").value = complaintId;
    setTimeout(() => trackComplaint(), 500);
  }
});
