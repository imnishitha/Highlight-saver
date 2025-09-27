# TextVault - Chrome Extension

A Chrome extension that allows you to save highlighted text to multiple platforms: Notion, Apple Notes, and Google Docs.

## Features

- 🖱️ Right-click context menu to save highlights
- ⌨️ Keyboard shortcut (Ctrl+Shift+S / Cmd+Shift+S)
- 📝 Save to Notion databases
- 🍎 Save to Apple Notes (macOS/iOS)
- 📄 Save to Google Docs
- ⚙️ Configurable default platform
- 🎯 Platform selection popup

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your toolbar

## Platform Setup

### 1. Notion Setup

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name (e.g., "Highlight Saver")
4. Copy the "Internal Integration Token"
5. Create a new database in Notion with these properties:
   - **Highlight** (Title) - for the highlighted text
   - **Source** (URL or Text) - for the source URL
   - **Date** (Date) - for when it was saved
6. Share your database with the integration:
   - Click the "..." menu in your database
   - Go to "Add connections"
   - Select your integration
7. Copy the database ID from the URL (the long string after the last slash)
8. Enter both the token and database ID in the extension options

### 2. Apple Notes Setup

Apple Notes integration works through URL schemes and requires no additional setup:

- **macOS**: Works directly with the Notes app
- **iOS Safari**: Opens highlights in the Notes app
- **Other browsers**: Falls back to copying content to clipboard

The extension will automatically format highlights and open them in Apple Notes.

### 3. Google Docs Setup

**Important**: For Google Docs integration to work, you need to set up OAuth credentials:

#### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google Docs API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Docs API"
   - Click "Enable"

#### Step 2: Set up OAuth 2.0
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the OAuth consent screen if prompted
4. Choose "Chrome extension" as application type
5. Add your extension ID to the "Application ID" field
6. Copy the Client ID

#### Step 3: Update manifest.json
Replace `YOUR_GOOGLE_CLIENT_ID` in `manifest.json` with your actual client ID:

```json
"oauth2": {
  "client_id": "your-actual-client-id.apps.googleusercontent.com",
  "scopes": ["https://www.googleapis.com/auth/documents"]
}
```

#### Step 4: Configure in Extension
1. Create a Google Doc where you want highlights to be saved
2. Copy the document ID from the URL: `docs.google.com/document/d/DOCUMENT_ID/edit`
3. Enter the document ID in the extension options
4. Click "Authenticate with Google" to grant permissions

## Usage

### Method 1: Keyboard Shortcut
1. Select text on any webpage
2. Press `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)
3. Choose your preferred platform from the popup

### Method 2: Right-Click Menu
1. Select text on any webpage
2. Right-click and select "Save highlight"
3. Choose your preferred platform from the popup

### Method 3: Default Platform
Set a default platform in the options to skip the selection popup and save directly to your preferred service.

## Configuration Options

### General Settings
- **Default Platform**: Set to always save to a specific platform or always show the selection popup
- **Maximum Highlight Length**: Control how much text can be saved (affects Notion only)

### Platform-Specific Settings
- **Notion**: Configure integration token and database ID
- **Apple Notes**: Choose note format (simple or detailed)
- **Google Docs**: Set up authentication and target document

## File Structure

```
extension/
├── manifest.json          # Extension manifest
├── background.js          # Background service worker
├── options.html          # Options page UI
├── options.js            # Options page logic
├── .gitignore           # Git ignore file
└── README.md            # This file
```

## Troubleshooting

### Notion Issues
- **"Invalid database ID"**: Make sure you're copying the full database ID from the URL
- **"Connection failed"**: Check that your integration token is correct and the database is shared with the integration
- **"Source property error"**: The extension will automatically retry with a different format

### Google Docs Issues
- **"Authentication failed"**: Make sure your OAuth client ID is correctly set in manifest.json
- **"Connection failed"**: Verify the document ID is correct and you have edit permissions
- **"Authentication expired"**: Re-authenticate through the options page

### Apple Notes Issues
- **"Notes not opening"**: This feature works best on macOS and iOS Safari
- **"Content not appearing"**: Check if the content was copied to clipboard as a fallback

### General Issues
- **Extension not working**: Make sure you've reloaded the extension after making changes
- **No context menu**: Check that you have text selected before right-clicking
- **Keyboard shortcut not working**: Verify the shortcut isn't conflicting with other extensions

## Privacy & Security

- **Notion**: Data is sent directly to Notion's API using your integration token
- **Apple Notes**: No data is sent to external servers; uses local URL schemes
- **Google Docs**: Data is sent to Google's API using OAuth authentication
- **Storage**: Only configuration data (tokens, IDs) is stored locally in Chrome's sync storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Feel free to use, modify, and distribute as needed.

## Changelog

### Version 2.0
- Added multi-platform support
- Redesigned options page with tabbed interface
- Added Apple Notes integration
- Added Google Docs integration
- Improved error handling and user feedback
- Enhanced UI with platform selection popup

### Version 1.0
- Initial release with Notion support only
