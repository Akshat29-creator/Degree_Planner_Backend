import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAvmTsMgyG5gOLu8nkLGVdkjHMD3M1EtUg",
    authDomain: "insta-v-7e7bc.firebaseapp.com",
    projectId: "insta-v-7e7bc",
    storageBucket: "insta-v-7e7bc.firebasestorage.app",
    messagingSenderId: "743216486858",
    appId: "1:743216486858:web:bd3213c820b6ef2dbb5733"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
