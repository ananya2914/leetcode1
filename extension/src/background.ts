import { auth, saveProblem, getUserStats, signInWithGoogle, User } from './firebase';

let currentUser: User | null = null;

// Initialize Firebase when the extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  console.log('LeetTrack extension installed');
  
  // Check if user is already signed in
  auth.onAuthStateChanged((user) => {
    console.log('Background: Auth state changed:', user);
    currentUser = user;
    updateExtensionIcon(user);
  });
});

// Update extension icon based on auth state
function updateExtensionIcon(user: User | null) {
  console.log('Updating extension icon for user:', user);
  // Use the same icon for both states
  chrome.action.setIcon({ path: 'icon48.png' });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  if (message.type === 'SAVE_PROBLEM') {
    if (!currentUser) {
      console.log('No user logged in, showing popup');
      // Show sign-in popup
      chrome.action.setPopup({ popup: 'popup.html' });
      sendResponse({ success: false, error: 'User not signed in' });
      return;
    }

    // Save problem data
    saveProblem(currentUser.uid, message.problem)
      .then(() => {
        console.log('Problem saved successfully');
        // Update popup stats
        chrome.runtime.sendMessage({ type: 'STATS_UPDATED' });
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Error saving problem:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  // Handle sign-in
  if (message.type === 'SIGN_IN') {
    console.log('Handling sign-in request');
    signInWithGoogle()
      .then((user) => {
        console.log('Sign-in successful:', user);
        currentUser = user;
        updateExtensionIcon(user);
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Sign-in error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
}); 