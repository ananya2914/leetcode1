import { auth, getUserStats, User } from './firebase';

interface Stats {
    total: number;
    easy: number;
    medium: number;
    hard: number;
    topics: Record<string, number>;
    recentProblems: Array<{
        id: string;
        title: string;
        difficulty: string;
        solvedAt: string;
    }>;
}

let currentUser: User | null = null;

// Initialize the page
async function initializePage() {
    console.log('Initializing options page...');
    
    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
        console.log('Auth state changed:', user);
        currentUser = user;
        
        if (user) {
            // Update user info
            document.getElementById('userName')!.textContent = user.displayName || 'User';
            document.getElementById('userEmail')!.textContent = user.email || '';
            
            // Load and display stats
            await loadAndDisplayStats();
        } else {
            // Show sign-in message
            document.getElementById('userInfo')!.innerHTML = `
                <div class="text-red-600">Please sign in to view your stats</div>
                <button id="signInButton" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Sign In
                </button>
            `;
            
            // Add sign-in button listener
            document.getElementById('signInButton')?.addEventListener('click', () => {
                chrome.runtime.sendMessage({ type: 'SIGN_IN' }, (response) => {
                    if (response?.success) {
                        window.location.reload();
                    }
                });
            });
        }
    });
}

// Load and display user stats
async function loadAndDisplayStats() {
    if (!currentUser) {
        console.log('No current user found');
        return;
    }
    
    try {
        console.log('Loading stats for user:', currentUser.uid);
        const rawStats = await getUserStats(currentUser.uid);
        console.log('Raw stats from Firebase:', rawStats);
        
        // Transform the raw stats to match our Stats interface
        const stats: Stats = {
            total: rawStats.total,
            easy: rawStats.easy,
            medium: rawStats.medium,
            hard: rawStats.hard,
            topics: rawStats.topics || {},
            recentProblems: rawStats.recentProblems || []
        };
        console.log('Transformed stats:', stats);
        displayStats(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
        showError('Failed to load stats. Please try again.');
    }
}

// Display stats in the UI
function displayStats(stats: Stats) {
    console.log('Displaying stats:', stats);
    
    // Update total solved
    const totalSolvedElement = document.getElementById('totalSolved');
    console.log('Total solved element:', totalSolvedElement);
    if (totalSolvedElement) {
        totalSolvedElement.textContent = stats.total.toString();
    }

    // Update difficulty breakdown
    const easyElement = document.getElementById('easySolved');
    const mediumElement = document.getElementById('mediumSolved');
    const hardElement = document.getElementById('hardSolved');
    
    console.log('Difficulty elements:', { easyElement, mediumElement, hardElement });
    
    if (easyElement) easyElement.textContent = stats.easy.toString();
    if (mediumElement) mediumElement.textContent = stats.medium.toString();
    if (hardElement) hardElement.textContent = stats.hard.toString();

    // Update topics distribution
    const topicsContainer = document.getElementById('topicDistribution');
    console.log('Topics container:', topicsContainer);
    if (topicsContainer) {
        topicsContainer.innerHTML = '';
        Object.entries(stats.topics)
            .sort(([, a], [, b]) => b - a)
            .forEach(([topic, count]) => {
                const topicElement = document.createElement('div');
                topicElement.className = 'p-4 bg-gray-50 rounded';
                topicElement.innerHTML = `
                    <div class="font-semibold text-gray-800">${topic}</div>
                    <div class="text-2xl font-bold text-gray-600">${count}</div>
                `;
                topicsContainer.appendChild(topicElement);
            });
    }

    // Update recent activity
    const recentActivityContainer = document.getElementById('recentActivity');
    console.log('Recent activity container:', recentActivityContainer);
    if (recentActivityContainer) {
        recentActivityContainer.innerHTML = '';
        stats.recentProblems.forEach(problem => {
            const activityElement = document.createElement('div');
            activityElement.className = 'flex items-center justify-between p-4 bg-gray-50 rounded';
            activityElement.innerHTML = `
                <div>
                    <div class="font-semibold text-gray-800">${problem.title}</div>
                    <div class="text-sm text-gray-600">ID: ${problem.id}</div>
                </div>
                <div class="flex items-center">
                    <span class="difficulty-${problem.difficulty.toLowerCase()} font-semibold">
                        ${problem.difficulty}
                    </span>
                    <span class="ml-4 text-sm text-gray-500">
                        ${new Date(problem.solvedAt).toLocaleDateString()}
                    </span>
                </div>
            `;
            recentActivityContainer.appendChild(activityElement);
        });
    }
}

// Show error message
function showError(message: string) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow-lg';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 