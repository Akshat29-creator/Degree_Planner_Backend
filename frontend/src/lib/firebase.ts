import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBcWO52DqMtscWy9igR1nGPvI8U9V9Ek5I",
    authDomain: "insta-v-7e7bc.firebaseapp.com",
    projectId: "insta-v-7e7bc",
    storageBucket: "insta-v-7e7bc.firebasestorage.app",
    messagingSenderId: "743216486858",
    appId: "1:743216486858:web:70b7bc435adc9edebb5733"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
