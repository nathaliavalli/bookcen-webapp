// js/firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Your Firebase config - ONLY PUT YOUR KEYS HERE, ONCE
const firebaseConfig = {
    apiKey: "AIzaSyDD6-jEYTUG4Q5n2tSgW4MX9DnLN_-eh4w",
    authDomain: "bookcen.firebaseapp.com",
    projectId: "bookcen",
    storageBucket: "bookcen.firebasestorage.app",
    messagingSenderId: "769443859645",
    appId: "1:769443859645:web:02fd0669a003501fec7bd4",
    measurementId: "G-YZCFLLEGM3"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Helper function to get current user profile
export async function getUserProfile(uid) {
    try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

// Helper function to create user profile
export async function createUserProfile(uid, userData) {
    try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const docRef = doc(db, 'users', uid);
        await setDoc(docRef, {
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error creating user profile:', error);
        return false;
    }
}

// Helper function to get children for a parent
export async function getChildrenForParent(parentUid) {
    try {
        const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const q = query(
            collection(db, 'users'), 
            where('parentId', '==', parentUid),
            where('type', '==', 'child')
        );
        const querySnapshot = await getDocs(q);
        const children = [];
        querySnapshot.forEach((doc) => {
            children.push({ id: doc.id, ...doc.data() });
        });
        return children;
    } catch (error) {
        console.error('Error getting children:', error);
        return [];
    }
}

// Helper function to get assignments for a child
export async function getAssignmentsForChild(childUid) {
    try {
        const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const q = query(
            collection(db, 'assignments'),
            where('childId', '==', childUid)
        );
        const querySnapshot = await getDocs(q);
        const assignments = [];
        querySnapshot.forEach((doc) => {
            assignments.push({ id: doc.id, ...doc.data() });
        });
        return assignments;
    } catch (error) {
        console.error('Error getting assignments:', error);
        return [];
    }
}

// Helper function to create a new assignment
export async function createAssignment(assignmentData) {
    try {
        const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const docRef = await addDoc(collection(db, 'assignments'), {
            ...assignmentData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating assignment:', error);
        return null;
    }
}

// Helper function to update assignment progress
export async function updateAssignmentProgress(assignmentId, progressData) {
    try {
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const docRef = doc(db, 'assignments', assignmentId);
        await updateDoc(docRef, {
            ...progressData,
            updatedAt: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error updating assignment progress:', error);
        return false;
    }
}

// Helper function to get current user (returns a Promise)
export function getCurrentUser() {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe(); // Unsubscribe after getting the user once
            resolve(user);
        });
    });
}

// Helper function to check if user is authenticated
export async function requireAuth(requiredType = null) {
    const user = await getCurrentUser();
    
    if (!user) {
        window.location.href = '/pages/login.html';
        return null;
    }
    
    if (requiredType) {
        const profile = await getUserProfile(user.uid);
        if (!profile || profile.type !== requiredType) {
            alert(`Access denied. This page is for ${requiredType}s only.`);
            window.location.href = '/pages/login.html';
            return null;
        }
        return { user, profile };
    }
    
    return { user, profile: await getUserProfile(user.uid) };
}