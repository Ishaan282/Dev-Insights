// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage"
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyCFXmn01oeeE-zjN3iTEcYm0Tl5FngwNI4",
//     authDomain: "dev-insights-5acb3.firebaseapp.com",
//     projectId: "dev-insights-5acb3",
//     storageBucket: "dev-insights-5acb3.firebasestorage.app",
//     messagingSenderId: "677665278800",
//     appId: "1:677665278800:web:0b37e4dd1c114385b83a55"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const storage = getStorage(app)

// //this function is gonna show how much file has been uploaded 
// export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
//     return new Promise((resolve,reject) =>{
//         try {
//             const storageRef = ref(storage,file.name)
//             const uploadTask = uploadBytesResumable(storageRef, file)

//             uploadTask.on('state_changed', (snapshot) => {
//                 const progress = Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100
//                 if(setProgress) setProgress(progress)
//                     switch(snapshot.state){
//                         case 'paused':
//                             console.log('Upload is paused'); break;
//                         case 'running':
//                             console.log('upload is running'); break;
//                     }
//             }, error => {
//                 reject(error)
//             }, () => {
//                 getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl => {
//                     resolve(downloadUrl)
//                 })
//             })
//         } catch (error) {
//             console.error(error)
//             reject(error)
//         } //if there's an error
//     })
// } //now you can call this in frontend



// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY ;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials in environment variables");
}

// console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
// console.log("Supabase Key:", process.env.NEXT_PUBLIC_SUPABASE_KEY ? "Loaded" : "Missing");


const supabase = createClient(supabaseUrl, supabaseKey);

export const storage = supabase.storage;

// This function is gonna show how much file has been uploaded
export async function uploadFile(file: File, setProgress?: (progress: number) => void): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`; // Generate a unique file name
            const filePath = `${fileName}`;

            // Simulate progress updates (Supabase doesn't natively support progress tracking)
            let progress = 0;
            const interval = setInterval(() => {
                if (setProgress) {
                    progress = Math.min(progress + 10, 100); // Simulate progress
                    setProgress(progress);
                }
            }, 700); // Update progress every 300ms

            // Upload file to Supabase Storage
            const { data, error } = await supabase.storage
                .from('uploadvid') // Your bucket name
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            clearInterval(interval); // Stop the progress simulation

            if (error) {
                reject(error);
            } else {
                // Get the public URL of the uploaded file
                const { data: publicUrlData } = supabase.storage
                    .from('uploadvid')
                    .getPublicUrl(filePath);

                resolve(publicUrlData.publicUrl);
            }
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}