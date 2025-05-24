import { auth, signInWithGoogle, signOut, getUserStats } from './firebase';
import { User } from './firebase';

// DOM Elements
const signInButton = document.getElementById('signInButton') as HTMLButtonElement;
const signOutButton = document.getElementById('signOutButton') as HTMLButtonElement;
const userInfo = document.getElementById('userInfo') as HTMLDivElement;
const statsContainer = document.getElementById('statsContainer') as HTMLDivElement;
const totalSolved = document.getElementById('totalSolved') as HTMLSpanElement;
const easySolved = document.getElementById('easySolved') as HTMLSpanElement;
const mediumSolved = document.getElementById('mediumSolved') as HTMLSpanElement;
const hardSolved = document.getElementById('hardSolved') as HTMLSpanElement;

// Update stats display
async function updateStats(user: User | null) {
  console.log('Updating stats for user:', user);
  if (!user) {
    console.log('No user logged in');
    statsContainer.style.display = 'none';
    return;
  }

  try {
    const stats = await getUserStats(user.uid);
    console.log('Retrieved stats:', stats);
    
    totalSolved.textContent = stats.total.toString();
    easySolved.textContent = stats.easy.toString();
    mediumSolved.textContent = stats.medium.toString();
    hardSolved.textContent = stats.hard.toString();
    
    statsContainer.style.display = 'block';
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

// Handle sign in
async function handleSignIn() {
  console.log('Starting sign in process...');
  try {
    console.log('Attempting direct sign in...');
    const user = await signInWithGoogle();
    console.log('Sign in successful:', user);
    updateUI(user);
  } catch (error) {
    console.error('Direct sign-in failed:', error);
    console.log('Attempting message-based sign in...');
    try {
      const response = await chrome.runtime.sendMessage({ type: 'SIGN_IN' });
      console.log('Sign in response:', response);
      if (response.success) {
        updateUI(response.user);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Sign-in failed:', error);
      alert('Failed to sign in. Please try again.');
    }
  }
}

// Handle sign out
async function handleSignOut() {
  try {
    await signOut();
    updateUI(null);
  } catch (error) {
    console.error('Error signing out:', error);
    alert('Failed to sign out. Please try again.');
  }
}

// Update UI based on auth state
function updateUI(user: User | null) {
  if (user) {
    userInfo.textContent = `Signed in as: ${user.email}`;
    signInButton.style.display = 'none';
    signOutButton.style.display = 'block';
    updateStats(user);
  } else {
    userInfo.textContent = 'Not signed in';
    signInButton.style.display = 'block';
    signOutButton.style.display = 'none';
    statsContainer.style.display = 'none';
  }
}

// Listen for auth state changes
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user);
  updateUI(user);
});

// Event Listeners
signInButton.addEventListener('click', handleSignIn);
signOutButton.addEventListener('click', handleSignOut);

// Listen for stats updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'STATS_UPDATED') {
    const user = auth.currentUser;
    if (user) {
      updateStats(user);
    }
  }
});

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup initialized');
  
  // Check auth state
  auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user);
    updateUI(user);
  });

  // Add event listeners
  document.getElementById('refreshBtn')?.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
      updateStats(user);
    }
  });
  document.getElementById('openDashboard')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });
}); 