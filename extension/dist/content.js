/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

// Convert difficulty to proper case
const difficultyMap = {
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard'
};
// Function to show success message
function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.textContent = message;
    successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 10000;
    `;
    document.body.appendChild(successMessage);
    setTimeout(() => successMessage.remove(), 3000);
}
// Function to extract problem data from the page
function extractProblemData() {
    console.log('[LeetTrack] Extracting problem data...');
    // Get problem title - try multiple selectors
    const titleSelectors = [
        '[data-cy="question-title"]',
        '.mr-2.text-lg',
        'h3.text-lg',
        '.text-title-large',
        '[class*="question-title"]',
        // New selectors based on LeetCode's current structure
        'div[class*="title"]',
        'h3[class*="title"]',
        'div[class*="problem-title"]',
        'h3[class*="problem-title"]',
        'div[class*="question-title"]',
        'h3[class*="question-title"]',
        // Try to find any h3 element that might contain the title
        'h3',
        // Try to find any div with text that looks like a problem title
        'div[class*="text"]'
    ];
    let title = '';
    for (const selector of titleSelectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`[LeetTrack] Checking title selector "${selector}":`, elements.length, 'elements found');
        for (const element of elements) {
            const text = element.textContent?.trim();
            // Skip elements that are likely not the problem title
            if (text &&
                text.length > 0 &&
                !text.includes('Submit') &&
                !text.includes('Run') &&
                !text.includes('Problem List') &&
                !text.includes('Description') &&
                !text.includes('Example') &&
                !text.includes('Constraints') &&
                text.length < 100) { // Problem titles are usually not very long
                title = text;
                console.log(`[LeetTrack] Found title using selector "${selector}":`, title);
                break;
            }
        }
        if (title)
            break;
    }
    // Get problem ID from URL
    const problemId = window.location.pathname.split('/')[2];
    console.log('[LeetTrack] Problem ID:', problemId);
    // Get difficulty - try multiple selectors
    const difficultySelectors = [
        '[diff]',
        '[class*="difficulty"]',
        '[class*="label"]'
    ];
    let difficulty = 'Easy';
    for (const selector of difficultySelectors) {
        const element = document.querySelector(selector);
        const diffText = element?.textContent?.toLowerCase() || element?.getAttribute('diff')?.toLowerCase() || '';
        if (diffText.includes('easy') || diffText.includes('medium') || diffText.includes('hard')) {
            difficulty = difficultyMap[diffText] || 'Easy';
            console.log(`[LeetTrack] Found difficulty using selector "${selector}":`, difficulty);
            break;
        }
    }
    // Get topics - try multiple selectors
    const topicSelectors = [
        '[data-cy="topic-tag"]',
        '[class*="topic-tag"]',
        '[class*="tag"]'
    ];
    let topics = [];
    for (const selector of topicSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            topics = Array.from(elements).map(el => el.textContent?.trim() || '').filter(Boolean);
            console.log(`[LeetTrack] Found topics using selector "${selector}":`, topics);
            break;
        }
    }
    if (!title || !problemId) {
        console.log('[LeetTrack] Missing required data:', { title, problemId });
        return null;
    }
    const problemData = {
        id: problemId,
        title,
        difficulty,
        topics,
        solvedAt: Date.now(),
        status: 'solved',
        severity: 'success'
    };
    console.log('[LeetTrack] Extracted problem data:', problemData);
    return problemData;
}
// Function to check if problem is solved
function isProblemSolved() {
    console.log('[LeetTrack] Checking if problem is solved...');
    // Check for submission status
    const selectors = [
        '.text-success', // Original selector
        '[data-cy="submission-status"]', // Submission status
        '[data-cy="submission-result"]', // Submission result
        '.text-green-s', // Green success text
        '.success' // Success class
    ];
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`[LeetTrack] Checking selector "${selector}":`, elements.length, 'elements found');
        for (const element of elements) {
            const text = element.textContent?.toLowerCase() || '';
            console.log(`[LeetTrack] Element text: "${text}"`);
            if (text.includes('accepted') || text.includes('success')) {
                console.log('[LeetTrack] Found accepted/success status!');
                return true;
            }
        }
    }
    // Check if we're on a submissions page
    if (window.location.href.includes('/submissions/')) {
        console.log('[LeetTrack] On submissions page, checking status...');
        const statusElement = document.querySelector('[data-cy="submission-status"]');
        const statusText = statusElement?.textContent?.toLowerCase() || '';
        console.log('[LeetTrack] Submission status:', statusText);
        if (statusText.includes('accepted')) {
            console.log('[LeetTrack] Found accepted status on submissions page!');
            return true;
        }
    }
    console.log('[LeetTrack] No solved status found');
    return false;
}
// Function to handle problem submission
function handleProblemSubmission() {
    console.log('[LeetTrack] Handling problem submission...');
    // Add a delay to ensure the page is fully loaded
    setTimeout(() => {
        if (isProblemSolved()) {
            console.log('[LeetTrack] Problem is solved, extracting data...');
            const problemData = extractProblemData();
            if (problemData) {
                console.log('[LeetTrack] Sending problem data to background script:', problemData);
                try {
                    chrome.runtime.sendMessage({ type: 'SAVE_PROBLEM', problem: problemData }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('[LeetTrack] Runtime error:', chrome.runtime.lastError);
                            showSuccessMessage('Failed to track problem. Please try again.');
                            return;
                        }
                        console.log('[LeetTrack] Background script response:', response);
                        if (response?.success) {
                            showSuccessMessage('Problem tracked successfully!');
                        }
                        else {
                            console.error('[LeetTrack] Failed to save problem:', response?.error);
                            showSuccessMessage('Failed to track problem. Please try again.');
                        }
                    });
                }
                catch (error) {
                    console.error('[LeetTrack] Error sending message:', error);
                    showSuccessMessage('Failed to track problem. Please try again.');
                }
            }
            else {
                console.log('[LeetTrack] Could not extract problem data');
            }
        }
        else {
            console.log('[LeetTrack] Problem is not solved yet');
        }
    }, 1000); // Wait 1 second for the page to be fully loaded
}
// Listen for submission events
function setupSubmissionListener() {
    console.log('[LeetTrack] Setting up submission listener...');
    // Listen for the submission button click - try multiple selectors
    const submitButtonSelectors = [
        '[data-cy="submit-code-btn"]',
        '[class*="submit"]',
        'button[type="submit"]',
        // New selectors based on LeetCode's current structure
        'button[class*="submit"]',
        'button[class*="btn"]',
        'button[class*="button"]',
        // Look for any button that might be the submit button
        'button'
    ];
    let submitButton = null;
    for (const selector of submitButtonSelectors) {
        const buttons = document.querySelectorAll(selector);
        console.log(`[LeetTrack] Checking submit button selector "${selector}":`, buttons.length, 'elements found');
        for (const button of buttons) {
            const text = button.textContent?.toLowerCase() || '';
            if (text.includes('submit')) {
                submitButton = button;
                console.log(`[LeetTrack] Found submit button using selector "${selector}" with text:`, text);
                break;
            }
        }
        if (submitButton)
            break;
    }
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            console.log('[LeetTrack] Submit button clicked');
            // Wait for the submission to complete
            setTimeout(handleProblemSubmission, 2000);
        });
    }
    else {
        console.log('[LeetTrack] Submit button not found, will retry in 1 second');
        // Retry finding the submit button after a short delay
        setTimeout(setupSubmissionListener, 1000);
    }
    // Also listen for URL changes (for when user navigates to a problem)
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            console.log('[LeetTrack] URL changed from', lastUrl, 'to', location.href);
            lastUrl = location.href;
            // Check if we're on a problem page or submissions page
            if (location.href.includes('/problems/') || location.href.includes('/submissions/')) {
                console.log('[LeetTrack] On problem/submission page, checking status...');
                handleProblemSubmission();
            }
        }
    }).observe(document, { subtree: true, childList: true });
    // Initial check
    if (location.href.includes('/problems/') || location.href.includes('/submissions/')) {
        console.log('[LeetTrack] Initial check for problem status...');
        handleProblemSubmission();
    }
}
// Initialize the content script
console.log('[LeetTrack] Content script initialized');
// Add a DOMContentLoaded listener to ensure the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[LeetTrack] DOM fully loaded, setting up listeners...');
    setupSubmissionListener();
});
// Also set up listeners immediately in case DOMContentLoaded already fired
setupSubmissionListener();

/******/ })()
;
//# sourceMappingURL=content.js.map