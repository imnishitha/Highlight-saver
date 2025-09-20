// Load saved configuration
chrome.storage.sync.get(["notionToken", "databaseId"], ({ notionToken, databaseId }) => {
  if (notionToken) document.getElementById("token").value = notionToken;
  if (databaseId) document.getElementById("dbid").value = databaseId;
});

// Save configuration
document.getElementById("save").addEventListener("click", () => {
  const notionToken = document.getElementById("token").value.trim();
  let databaseId = document.getElementById("dbid").value.trim();
  
  if (!notionToken || !databaseId) {
    showStatus("Please fill in both fields", "error");
    return;
  }

  // Clean database ID - remove everything after ? if present
  databaseId = extractDatabaseId(databaseId);
  document.getElementById("dbid").value = databaseId; // Update the field with cleaned ID
  
  if (!isValidUUID(databaseId)) {
    showStatus("Invalid database ID format. Please check the ID.", "error");
    return;
  }

  chrome.storage.sync.set({ notionToken, databaseId }, () => {
    showStatus("Configuration saved successfully!", "success");
  });
});

// Test connection
document.getElementById("test").addEventListener("click", async () => {
  const notionToken = document.getElementById("token").value.trim();
  let databaseId = document.getElementById("dbid").value.trim();
  
  if (!notionToken || !databaseId) {
    showStatus("Please fill in both fields before testing", "error");
    return;
  }

  // Clean database ID
  databaseId = extractDatabaseId(databaseId);
  document.getElementById("dbid").value = databaseId; // Update the field
  
  console.log("Final database ID being used:", databaseId);
  console.log("Request URL will be:", `https://api.notion.com/v1/databases/${databaseId}`);
  
  if (!isValidUUID(databaseId)) {
    showStatus("Invalid database ID format. Please check the ID.", "error");
    return;
  }

  showStatus("Testing connection...", "");
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${notionToken}`,
        "Notion-Version": "2022-06-28"
      }
    });

    if (response.ok) {
      const data = await response.json();
      showStatus(`✓ Connection successful! Database: "${data.title[0]?.plain_text || 'Untitled'}"`, "success");
    } else {
      const error = await response.text();
      console.error("Full error response:", error);
      showStatus(`✗ Connection failed: ${response.status} - ${error}`, "error");
    }
  } catch (error) {
    showStatus(`✗ Connection failed: ${error.message}`, "error");
  }
});

function showStatus(message, type) {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = message;
  statusDiv.className = "status " + type;
}


function extractDatabaseId(input) {
  console.log("Original input:", input);
  

  let cleaned = input.split('?')[0].split('#')[0];
  console.log("After removing query params:", cleaned);
  

  if (cleaned.includes('notion.so')) {
    const parts = cleaned.split('/');
    cleaned = parts[parts.length - 1];
    console.log("After extracting from URL:", cleaned);
  }
  

  const cleanId = cleaned.replace(/-/g, '');
  console.log("Clean ID (no dashes):", cleanId);
  

  if (cleanId.length === 32) {
    const formatted = cleanId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    console.log("Final formatted ID:", formatted);
    return formatted;
  }
  
  console.log("Returning uncleaned (wrong length):", cleaned);
  return cleaned;
}

function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}