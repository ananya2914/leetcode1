import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signInWithCredential, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';

// Export the User type
export type User = FirebaseUser;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5_yQQIzfbjdN4apjzPgpT6sMCqQmXhqE",
  authDomain: "leetcodetracker-c5bf5.firebaseapp.com",
  databaseURL: "https://leetcodetracker-c5bf5-default-rtdb.firebaseio.com",
  projectId: "leetcodetracker-c5bf5",
  storageBucket: "leetcodetracker-c5bf5.firebasestorage.app",
  messagingSenderId: "322839739416",
  appId: "1:322839739416:web:8bb8e2a26caf2fe8e9176d",
  measurementId: "G-T3YQTVK441"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Types
export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  solvedAt: number;
  timeTaken?: number;
  status: 'solved' | 'attempted';
}

export interface UserStats {
  totalSolved: number;
  streak: number;
  todaySolved: number;
  lastSolvedDate: number;
}

// Firebase functions
export const signInWithGoogle = async (): Promise<User> => {
  return new Promise((resolve, reject) => {
    // First, get the OAuth token from Chrome
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError) {
        console.error('Chrome identity error:', chrome.runtime.lastError);
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (!token) {
        console.error('No token received from Chrome identity');
        reject(new Error('No token received'));
        return;
      }

      try {
        // Create a credential with the token
        const credential = GoogleAuthProvider.credential(null, token);
        
        // Sign in to Firebase with the credential
        const result = await signInWithCredential(auth, credential);
        console.log('Firebase sign in successful:', result.user);
        resolve(result.user);
      } catch (error) {
        console.error('Firebase sign in error:', error);
        reject(error);
      }
    });
  });
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    // Revoke the token
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        // Revoke the token from Google
        fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
          .then(() => {
            // Remove the token from Chrome's cache
            chrome.identity.removeCachedAuthToken({ token }, () => {
              console.log('Token removed from cache');
            });
          })
          .catch(error => {
            console.error('Error revoking token:', error);
          });
      }
    });
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const saveProblem = async (userId: string, problemData: any) => {
  const { collection, doc, setDoc } = await import('firebase/firestore');
  const problemRef = doc(collection(db, 'users', userId, 'problems'), problemData.id);
  await setDoc(problemRef, {
    ...problemData,
    solvedAt: new Date().toISOString()
  });
};

export const getUserStats = async (userId: string) => {
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const problemsRef = collection(db, 'users', userId, 'problems');
  const q = query(problemsRef);
  const snapshot = await getDocs(q);
  
  const stats = {
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    topics: {} as Record<string, number>,
    recentProblems: [] as Array<{id: string; title: string; difficulty: string; solvedAt: string}>
  };

  snapshot.forEach(doc => {
    const data = doc.data();
    stats.total++;
    const difficulty = data.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
    if (difficulty in stats) {
      stats[difficulty]++;
    }
    
    // Count topics
    if (data.topics) {
      data.topics.forEach((topic: string) => {
        stats.topics[topic] = (stats.topics[topic] || 0) + 1;
      });
    }
    
    // Add to recent problems
    stats.recentProblems.push({
      id: data.id,
      title: data.title,
      difficulty: data.difficulty,
      solvedAt: data.solvedAt
    });
  });

  // Sort recent problems by solvedAt date
  stats.recentProblems.sort((a, b) => 
    new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime()
  );
  
  // Keep only the 10 most recent problems
  stats.recentProblems = stats.recentProblems.slice(0, 10);

  return stats;
};

export { auth, db }; 