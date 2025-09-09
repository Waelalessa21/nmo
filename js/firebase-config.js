const firebaseConfig = {
    apiKey: "AIzaSyAadfXJAPEQ0fB7z9Flco7NGlAm89ROiys",
    authDomain: "nmo-web-40c96.firebaseapp.com",
    projectId: "nmo-web-40c96",
    storageBucket: "nmo-web-40c96.firebasestorage.app",
    messagingSenderId: "465247665481",
    appId: "1:465247665481:web:6b34e3aa69b6a4377dae98",
    measurementId: "G-20CVGK971Y"
  };
  
  let db = null;
  let collection = null;
  let addDoc = null;
  let isFirebaseReady = false;
  
  async function initFirebase() {
    if (isFirebaseReady) {
      return { db, collection, addDoc };
    }
    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getFirestore, collection: firestoreCollection, addDoc: firestoreAddDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      collection = firestoreCollection;
      addDoc = firestoreAddDoc;
      isFirebaseReady = true;
      return { db, collection, addDoc };
    } catch (error) {
      isFirebaseReady = false;
      return { db: null, collection: null, addDoc: null };
    }
  }
  
  initFirebase();
  
  export { db, collection, addDoc, initFirebase };
  