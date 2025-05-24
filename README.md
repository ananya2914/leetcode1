# LeetTrack - LeetCode Progress Tracker

A Chrome extension that helps you track your LeetCode progress, analyze your performance, and stay motivated.

## Features

- 📊 **Progress Tracking**: Track your solved problems, difficulty distribution, and topic-wise progress
- 🔥 **Streak Tracking**: Maintain your daily streak and stay motivated
- ⚡ **Real-time Updates**: Get instant updates on your progress
- 📈 **Detailed Statistics**: View your performance metrics and improvement over time
- 🔐 **Secure Authentication**: Sign in with your Google account

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/leet-track.git
   cd leet-track
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory from the project folder

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Chrome browser

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### Project Structure

```
leet-track/
├── src/                    # Source files
│   ├── background.ts      # Background script
│   ├── content.ts         # Content script
│   ├── popup.ts           # Popup UI
│   ├── options.ts         # Options page
│   └── firebase.ts        # Firebase configuration
├── public/                # Static assets
│   ├── popup.html        # Popup HTML
│   ├── options.html      # Options page HTML
│   └── icons/            # Extension icons
├── dist/                  # Build output
├── website/              # Landing page
└── package.json          # Project configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [LeetCode](https://leetcode.com/) for providing the platform
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling 