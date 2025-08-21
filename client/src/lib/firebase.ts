import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return await signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions
export const addDocument = async (collectionName: string, data: any) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  await deleteDoc(doc(db, collectionName, docId));
};

export const getDocuments = async (collectionName: string, conditions?: { field: string; operator: any; value: any }[]) => {
  let q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
  
  if (conditions) {
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToCollection = (
  collectionName: string, 
  callback: (docs: any[]) => void,
  conditions?: { field: string; operator: any; value: any }[]
) => {
  let q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
  
  if (conditions) {
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(docs);
  });
};