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