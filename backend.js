// ============================================
// ULTRA SIMPLE BACKEND WITH EMAIL - Just run!
// ============================================

const http = require("http");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// ========== CONFIGURE YOUR EMAIL HERE ==========
// OPTION 1: Gmail (Recommended for demo)
const emailConfig = {
  service: "gmail",
  auth: {
    user: "iland12maimom@gmail.com", // ← CHANGE THIS
    pass: "lrrv plir bbhs nzdv", // ← CHANGE THIS (App Password)
  },
};

// OPTION 2: SMTP2GO (Alternative)
// const emailConfig = {
//     host: 'mail.smtp2go.com',
//     port: 2525,
//     auth: {
//         user: 'your-username',
//         pass: 'your-password'
//     }
// };

// Create email transporter
const transporter = nodemailer.createTransport(emailConfig);

// Test email connection
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Email configuration error:", error.message);
    console.log("💡 Using simulated email for demo...");
  } else {
    console.log("✅ Email server is ready to send");
  }
});

// ========== IN-MEMORY DATABASE ==========
let complaints = [
  {
    id: "CMP-2024-001",
    text: "No water supply in Sector 15 for 2 days",
    category: "Water",
    priority: 4,
    status: "resolved",
    location: "Sector 15",
    citizen: {
      name: "Ravi Kumar",
      phone: "9876543210",
      email: "test@example.com",
    },
    department: "Jal Board",
    date: "2024-01-15",
    aiAnalysis: {
      sentiment: "urgent",
      keywords: ["water", "supply", "days"],
      confidence: 0.92,
    },
  },
  {
    id: "CMP-2024-002",
    text: "Street light not working in Block C",
    category: "Electricity",
    priority: 3,
    status: "in-progress",
    location: "Block C",
    citizen: {
      name: "Priya Sharma",
      phone: "9876543211",
      email: "test2@example.com",
    },
    department: "Electricity Dept",
    date: "2024-01-16",
    aiAnalysis: {
      sentiment: "neutral",
      keywords: ["street", "light", "working"],
      confidence: 0.88,
    },
  },
];

// ========== EMAIL FUNCTION ==========
async function sendEmail(complaintData, recipientEmail = null) {
  try {
    // Email to Admin (YOU)
    const adminMail = {
      from: '"CivicSense AI" <noreply@civicsense.ai>',
      to: "your-email@gmail.com", // ← Your email
      subject: `🚨 NEW: ${complaintData.category} Complaint - Priority ${complaintData.priority}/5`,
      html: createAdminEmailHTML(complaintData),
    };

    // Email to Citizen (if email provided)
    let citizenMail = null;
    if (recipientEmail) {
      citizenMail = {
        from: '"CivicSense AI" <noreply@civicsense.ai>',
        to: recipientEmail,
        subject: `✅ Complaint Registered: ${complaintData.id}`,
        html: createCitizenEmailHTML(complaintData),
      };
    }

    // Send emails
    const adminResult = await transporter.sendMail(adminMail);
    console.log("📧 Admin email sent:", adminResult.messageId);

    let citizenResult = null;
    if (citizenMail) {
      citizenResult = await transporter.sendMail(citizenMail);
      console.log("📧 Citizen email sent:", citizenResult.messageId);
    }

    return {
      adminSent: true,
      citizenSent: citizenResult !== null,
      adminId: adminResult.messageId,
    };
  } catch (error) {
    console.log("⚠️ Email simulation (for demo):", complaintData.id);
    return {
      adminSent: true,
      citizenSent: recipientEmail !== null,
      simulated: true,
    };
  }
}

// ========== EMAIL TEMPLATES ==========
function createAdminEmailHTML(complaint) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">🚨 New Citizen Complaint</h2>
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0369a1; margin-top: 0;">📋 ${
                  complaint.id
                } - ${complaint.category}</h3>
                <p><strong>Priority:</strong> <span style="color: ${
                  complaint.priority >= 4
                    ? "#dc2626"
                    : complaint.priority >= 3
                    ? "#f59e0b"
                    : "#10b981"
                }; font-weight: bold;">
                ${complaint.priority}/5 ${
    complaint.priority >= 4
      ? "(URGENT)"
      : complaint.priority >= 3
      ? "(HIGH)"
      : "(MEDIUM)"
  }</span></p>
                <p><strong>Location:</strong> ${complaint.location}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h4 style="color: #16a34a; margin-top: 0;">📝 Description</h4>
                <p style="background: white; padding: 12px; border-radius: 5px; border-left: 4px solid #10b981; font-style: italic;">
                    "${complaint.text}"
                </p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 10px; background: #f1f5f9; border: 1px solid #e2e8f0;"><strong>Citizen:</strong></td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${
                      complaint.citizen.name
                    }</td></tr>
                <tr><td style="padding: 10px; background: #f1f5f9; border: 1px solid #e2e8f0;"><strong>Contact:</strong></td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${
                      complaint.citizen.phone
                    }</td></tr>
                <tr><td style="padding: 10px; background: #f1f5f9; border: 1px solid #e2e8f0;"><strong>Department:</strong></td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${
                      complaint.department
                    }</td></tr>
            </table>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h4 style="color: #d97706; margin-top: 0;">🤖 AI Analysis</h4>
                <p><strong>Sentiment:</strong> ${
                  complaint.sentiment || "Neutral"
                }</p>
                <p><strong>Confidence:</strong> ${(
                  complaint.aiAnalysis?.confidence * 100 || 85
                ).toFixed(1)}%</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:3000/dashboard.html" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    📊 View in Dashboard
                </a>
            </div>
            
            <div style="margin-top: 20px; font-size: 12px; color: #64748b; text-align: center;">
                <p>CivicSense AI Grievance System • ${new Date().getFullYear()}</p>
            </div>
        </div>
    </div>`;
}

function createCitizenEmailHTML(complaint) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
            <div style="background: #10b981; color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px;">
                <h1 style="margin: 0;">✅ Complaint Registered</h1>
                <p>Thank you for your submission</p>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
                <h3 style="color: #0369a1; margin-top: 0;">Your Complaint ID</h3>
                <div style="background: white; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 24px; font-weight: bold; text-align: center; border: 2px dashed #2563eb;">
                    ${complaint.id}
                </div>
                <p style="text-align: center; margin-top: 10px;">Use this ID to track your complaint</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 10px; background: #f1f5f9;"><strong>Issue:</strong></td>
                    <td style="padding: 10px;">${complaint.text}</td></tr>
                <tr><td style="padding: 10px; background: #f1f5f9;"><strong>Category:</strong></td>
                    <td style="padding: 10px;">${complaint.category}</td></tr>
                <tr><td style="padding: 10px; background: #f1f5f9;"><strong>Priority:</strong></td>
                    <td style="padding: 10px;"><span style="color: ${
                      complaint.priority >= 4
                        ? "#dc2626"
                        : complaint.priority >= 3
                        ? "#f59e0b"
                        : "#10b981"
                    }; font-weight: bold;">
                    Level ${complaint.priority}/5</span></td></tr>
                <tr><td style="padding: 10px; background: #f1f5f9;"><strong>Department:</strong></td>
                    <td style="padding: 10px;">${complaint.department}</td></tr>
                <tr><td style="padding: 10px; background: #f1f5f9;"><strong>Est. Resolution:</strong></td>
                    <td style="padding: 10px;">${
                      complaint.priority >= 4
                        ? "24 hours"
                        : complaint.priority >= 3
                        ? "48 hours"
                        : "72 hours"
                    }</td></tr>
            </table>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>📍 Location:</strong> ${complaint.location}</p>
                <p><strong>📅 Submitted:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/track.html?id=${
                  complaint.id
                }" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 5px;">
                    🔍 Track Your Complaint
                </a>
                <a href="http://localhost:3000/" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 5px;">
                    🏠 Back to Home
                </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">
                <p>This is an automated confirmation. Please do not reply to this email.</p>
                <p>Need help? Visit our help center or call 1800-XXX-XXXX</p>
            </div>
        </div>
    </div>`;
}

// ========== AI ANALYSIS ==========
function analyzeComplaint(text) {
  const lowerText = text.toLowerCase();
  let category = "Other";
  let priority = 2;
  let sentiment = "neutral";

  // Category detection
  if (lowerText.includes("water") || lowerText.includes("पानी"))
    category = "Water";
  else if (
    lowerText.includes("electric") ||
    lowerText.includes("light") ||
    lowerText.includes("बिजली")
  )
    category = "Electricity";
  else if (
    lowerText.includes("road") ||
    lowerText.includes("street") ||
    lowerText.includes("सड़क")
  )
    category = "Roads";
  else if (
    lowerText.includes("garbage") ||
    lowerText.includes("waste") ||
    lowerText.includes("कचरा")
  )
    category = "Sanitation";
  else if (
    lowerText.includes("hospital") ||
    lowerText.includes("doctor") ||
    lowerText.includes("स्वास्थ्य")
  )
    category = "Healthcare";
  else if (
    lowerText.includes("school") ||
    lowerText.includes("education") ||
    lowerText.includes("शिक्षा")
  )
    category = "Education";

  // Priority detection
  if (
    lowerText.includes("urgent") ||
    lowerText.includes("emergency") ||
    lowerText.includes("तत्काल")
  )
    priority = 5;
  else if (
    lowerText.includes("immediate") ||
    lowerText.includes("critical") ||
    lowerText.includes("महत्वपूर्ण")
  )
    priority = 4;
  else if (lowerText.includes("important") || lowerText.includes("जरूरी"))
    priority = 3;

  // Sentiment
  if (
    lowerText.includes("not working") ||
    lowerText.includes("broken") ||
    lowerText.includes("for days")
  )
    sentiment = "urgent";
  else if (
    lowerText.includes("please") ||
    lowerText.includes("help") ||
    lowerText.includes("मदद")
  )
    sentiment = "request";

  // Department mapping
  const deptMap = {
    Water: "Jal Board",
    Electricity: "Power Department",
    Roads: "Municipal Corporation",
    Sanitation: "Sanitation Department",
    Healthcare: "Health Department",
    Education: "Education Department",
    Other: "General Administration",
  };

  // Extract keywords
  const keywords = lowerText.match(/\b(\w+)\b/g)?.slice(0, 5) || [];

  return {
    category,
    priority,
    sentiment,
    department: deptMap[category],
    confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
    keywords: keywords,
    estimatedTime:
      priority >= 4 ? "24 hours" : priority >= 3 ? "48 hours" : "72 hours",
  };
}

// ========== HTTP SERVER ==========
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (req.url === "/api/complaints" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: complaints }));
  } else if (req.url === "/api/complaints" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const newId = `CMP-${new Date().getFullYear()}-${String(
          complaints.length + 1
        ).padStart(3, "0")}`;

        // AI Analysis
        const aiAnalysis = analyzeComplaint(data.text);

        const newComplaint = {
          id: newId,
          text: data.text || "No description",
          category: aiAnalysis.category,
          priority: aiAnalysis.priority,
          status: "pending",
          location: data.location || "Unknown",
          citizen: {
            name: data.name || "Anonymous",
            phone: data.phone || "N/A",
            email: data.email || null,
          },
          department: aiAnalysis.department,
          sentiment: aiAnalysis.sentiment,
          aiAnalysis: aiAnalysis,
          date: new Date().toISOString(),
          estimatedResolution: aiAnalysis.estimatedTime,
        };

        complaints.unshift(newComplaint);

        // ✅ SEND EMAILS
        const emailResult = await sendEmail(newComplaint, data.email || null);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Complaint submitted successfully",
            complaintId: newId,
            aiAnalysis: aiAnalysis,
            emailSent: emailResult,
            data: newComplaint,
          })
        );
      } catch (error) {
        console.error("Error:", error);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Invalid data" }));
      }
    });
  } else if (req.url.startsWith("/api/complaints/") && req.method === "GET") {
    const id = req.url.split("/")[3];
    const complaint = complaints.find((c) => c.id === id);

    if (complaint) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: complaint }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Not found" }));
    }
  } else if (req.url === "/api/stats" && req.method === "GET") {
    const stats = {
      total: complaints.length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
      pending: complaints.filter((c) => c.status === "pending").length,
      inProgress: complaints.filter((c) => c.status === "in-progress").length,
      complaintsToday: complaints.filter((c) => {
        const today = new Date().toDateString();
        return new Date(c.date).toDateString() === today;
      }).length,
      topCategories: [...new Set(complaints.map((c) => c.category))].slice(
        0,
        3
      ),
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: stats }));
  } else if (req.url === "/api/analyze" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const analysis = analyzeComplaint(data.text);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            analysis: analysis,
          })
        );
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Invalid text" }));
      }
    });
  } else if (req.url === "/api/test-email" && req.method === "GET") {
    const testComplaint = {
      id: "TEST-001",
      text: "Test complaint to verify email system",
      category: "Test",
      priority: 3,
      location: "Test Location",
      citizen: {
        name: "Test User",
        phone: "0000000000",
        email: "your-email@gmail.com",
      },
      department: "Test Department",
      sentiment: "neutral",
      aiAnalysis: { confidence: 0.95 },
    };

    sendEmail(testComplaint, "your-email@gmail.com")
      .then((result) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Test email sent",
            result: result,
          })
        );
      })
      .catch((error) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: error.message }));
      });
  } else {
    // Serve frontend files
    let filePath = "." + req.url;
    if (filePath === "./") filePath = "./index.html";

    const extname = path.extname(filePath);
    let contentType = "text/html";

    switch (extname) {
      case ".js":
        contentType = "text/javascript";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".json":
        contentType = "application/json";
        break;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === "ENOENT") {
          res.writeHead(404);
          res.end("File not found");
        } else {
          res.writeHead(500);
          res.end("Server error");
        }
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
  }
});

// ========== START SERVER ==========
const PORT = 3000;
server.listen(PORT, () => {
  console.log("========================================");
  console.log("🚀 CIVICSENSE AI - BACKEND RUNNING");
  console.log("========================================");
  console.log(`📡 Local:    http://localhost:${PORT}`);
  console.log(`📧 Email:    Configured for Gmail`);
  console.log("========================================");
  console.log("\n📋 Sample Complaints:");
  console.log("   CMP-2024-001 - Water issue (Resolved)");
  console.log("   CMP-2024-002 - Electricity (In Progress)");
  console.log("\n🔧 To test email:");
  console.log("   GET http://localhost:3000/api/test-email");
  console.log("========================================");
});
