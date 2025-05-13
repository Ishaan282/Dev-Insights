// test-supabase.js
import { uploadFile } from '../firebase'; // Import the uploadFile function
import fs from 'fs'; // For reading files (if using a local file)
import path from 'path'; // For handling file paths

// Helper function to create a sample audio file (if you don't have one)
function createSampleAudioFile() {
    const filePath = path.join(__dirname, 'sample-audio.mp3');
    const sampleData = 'This is a sample audio file.'; // Dummy data for the file
    fs.writeFileSync(filePath, sampleData); // Write the dummy data to a file
    return filePath;
}

// Main test function
async function testSupabaseUpload() {
    try {
        // Step 1: Create or use an existing audio file
        const filePath = createSampleAudioFile(); // Create a sample audio file
        const file = fs.readFileSync(filePath); // Read the file

        // Step 2: Create a File object (mimicking the browser's File object)
        const fileObj = new File([file], 'sample-audio.mp3', { type: 'audio/mp3' });

        // Step 3: Upload the file using the uploadFile function
        console.log('Uploading file...');
        const publicUrl = await uploadFile(fileObj, (progress) => {
            console.log(`Upload progress: ${progress}%`);
        });

        // Step 4: Verify the upload
        console.log('File uploaded successfully!');
        console.log('Public URL:', publicUrl);

        // Step 5: Clean up (delete the sample file)
        fs.unlinkSync(filePath); // Delete the sample file
        console.log('Sample file deleted.');
    } catch (error) {
        console.error('Error during test:', error);
    }
}

// Run the test
testSupabaseUpload();