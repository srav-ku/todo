import { useState, useEffect } from 'react';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

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

export const useFirestoreAdd = (collectionName: string) => {
  const { user } = useAuth();
  
  return async (document: any) => {
    const docData = user ? { ...document, userId: user.uid } : document;
    return await addDocument(collectionName, docData);
  };
};

export const useFirestoreUpdate = (collectionName: string) => {
  return async (docId: string, updates: any) => {
    return await updateDocument(collectionName, docId, updates);
  };
};