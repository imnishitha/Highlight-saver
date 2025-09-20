// Create context menu for right-click
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveHighlight",
    title: "Save highlight to Notion (Ctrl+Shift+S)",
    contexts: ["selection"]
  });
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "save-highlight") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
      if (tab) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.getSelection().toString()
        }, (results) => {
          if (results && results[0] && results[0].result) {
            const selectedText = results[0].result;
            if (selectedText.trim()) {
              handleHighlightSave(selectedText, tab.url, tab.title, tab.id);
            } else {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                  const popup = document.createElement('div');
                  popup.innerHTML = '⚠️ Please select some text first!';
                  popup.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #ff9800;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 10000;
                    transition: opacity 0.3s ease;
                  `;
                  document.body.appendChild(popup);
                  
                  setTimeout(() => {
                    popup.style.opacity = '0';
                    setTimeout(() => popup.remove(), 300);
                  }, 3000);
                }
              });
            }
          }
        });
      }
    });
  }
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveHighlight") {
    handleHighlightSave(info.selectionText, tab.url, tab.title, tab.id);
  }
});

function handleHighlightSave(selectedText, url, title, tabId) {
  chrome.storage.sync.get(["notionToken", "databaseId"], ({ notionToken, databaseId }) => {
    if (!notionToken || !databaseId) {
      console.log("Missing Notion config - opening options page");
      chrome.runtime.openOptionsPage();
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          alert("⚠️ Please configure your Notion token and database ID first!\n\nThe options page will open in a new tab.");
        }
      });
      return;
    }
    

    const cleanDatabaseId = extractDatabaseId(databaseId);
    console.log("Original database ID:", databaseId);
    console.log("Cleaned database ID:", cleanDatabaseId);
    
    saveToNotion(notionToken, cleanDatabaseId, selectedText, url, title, tabId);
  });
}

// Send POST request to Notion
async function saveToNotion(token, databaseId, text, url, pageTitle, tabId) {
  try {
    const body = {
      parent: { database_id: databaseId },
      properties: {
        "Highlight": { 
          title: [{ 
            text: { 
              content: text.substring(0, 2000) 
            } 
          }] 
        },
        "Source": { 
          url: url 
        },
        "Date": { 
          date: { 
            start: new Date().toISOString().split('T')[0] 
          } 
        }
      }
    };

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      console.log("Successfully saved to Notion");
      // Show success popup
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          // Create a styled popup
          const popup = document.createElement('div');
          popup.innerHTML = '✅ Highlight saved to Notion!';
          popup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            transition: opacity 0.3s ease;
          `;
          document.body.appendChild(popup);
          
          setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 300);
          }, 3000);
        }
      });
    } else {
      const error = await response.text();
      console.error("Failed to save to Notion:", error);
      
      if (error.includes("Source is expected to be url")) {
        console.log("Retrying with rich_text format for Source...");
        const retryBody = {
          parent: { database_id: databaseId },
          properties: {
            "Highlight": { 
              title: [{ 
                text: { 
                  content: text.substring(0, 2000)
                } 
              }] 
            },
            "Source": { 
              rich_text: [{ 
                text: { 
                  content: pageTitle || url,
                  link: { url: url }
                } 
              }] 
            },
            "Date": { 
              date: { 
                start: new Date().toISOString().split('T')[0]
              } 
            }
          }
        };
        
        const retryResponse = await fetch("https://api.notion.com/v1/pages", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
          },
          body: JSON.stringify(retryBody)
        });
        
        if (retryResponse.ok) {
          console.log("Successfully saved to Notion (retry)");
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
              const popup = document.createElement('div');
              popup.innerHTML = '✅ Highlight saved to Notion!';
              popup.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                transition: opacity 0.3s ease;
              `;
              document.body.appendChild(popup);
              
              setTimeout(() => {
                popup.style.opacity = '0';
                setTimeout(() => popup.remove(), 300);
              }, 3000);
            }
          });
        } else {
          const retryError = await retryResponse.text();
          console.error("Retry also failed:", retryError);
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (errorMsg) => {
              const popup = document.createElement('div');
              popup.innerHTML = `❌ Failed to save highlight<br><small>${errorMsg}</small>`;
              popup.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f44336;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                cursor: pointer;
              `;
              document.body.appendChild(popup);
              
              popup.onclick = () => popup.remove();
              setTimeout(() => popup.remove(), 8000);
            },
            args: [retryError.substring(0, 100)]
          });
        }
      } else {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: (errorMsg) => {
            const popup = document.createElement('div');
            popup.innerHTML = `❌ Failed to save highlight<br><small>Click to dismiss</small>`;
            popup.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #f44336;
              color: white;
              padding: 12px 20px;
              border-radius: 8px;
              font-family: Arial, sans-serif;
              font-size: 14px;
              font-weight: 500;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              z-index: 10000;
              cursor: pointer;
            `;
            document.body.appendChild(popup);
            
            popup.onclick = () => popup.remove();
            setTimeout(() => popup.remove(), 8000);
          }
        });
      }
    }
  } catch (error) {
    console.error("Error saving to Notion:", error);
  }
}


function extractDatabaseId(input) {

  let cleaned = input.split('?')[0].split('#')[0];
  

  if (cleaned.includes('notion.so')) {
    const parts = cleaned.split('/');
    cleaned = parts[parts.length - 1];
  }
  

  const cleanId = cleaned.replace(/-/g, '');
  

  if (cleanId.length === 32) {
    return cleanId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  }
  
  return cleaned; 
}