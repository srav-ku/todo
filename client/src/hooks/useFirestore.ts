import { useState, useEffect } from 'react';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, onSnapshot, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useFirestoreCollection = (collectionName: string, userSpecific: boolean = true) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user && userSpecific) {
      setData([]);
      setLoading(false);
      return;
    }

    const conditions = userSpecific ? [{ field: 'userId', operator: '==', value: user?.uid }] : undefined;

    const unsubscribe = subscribeToCollection(
      collectionName,
      (docs) => {
        setData(docs);
        setLoading(false);
      },
      conditions
    );

    return unsubscribe;
  }, [collectionName, user?.uid, userSpecific]);

  const add = async (document: any) => {
    const docData = userSpecific && user ? { ...document, userId: user.uid } : document;
    return await addDocument(collectionName, docData);
  };

  const update = async (docId: string, updates: any) => {
    return await updateDocument(collectionName, docId, updates);
  };

  const remove = async (docId: string) => {
    return await deleteDocument(collectionName, docId);
  };

  return {
    data,
    loading,
    add,
    update,
    remove,
  };
};

export function useFirestoreAdd(collectionName: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return async (data: any) => {
    if (!user) throw new Error('User not authenticated');

    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    queryClient.invalidateQueries({ queryKey: [collectionName] });
    return docRef.id;
  };
}

export function useFirestoreUpdate(collectionName: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return async (id: string, data: any) => {
    if (!user) throw new Error('User not authenticated');

    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });

    queryClient.invalidateQueries({ queryKey: [collectionName] });
  };
}

export function useFirestoreDelete(collectionName: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);

    queryClient.invalidateQueries({ queryKey: [collectionName] });
  };
}