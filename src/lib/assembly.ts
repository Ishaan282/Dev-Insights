import { AssemblyAI } from 'assemblyai';

const apiKey = process.env.ASSEMBLYAI_API_KEY;

if (!apiKey) {
    throw new Error('ASSEMBLYAI_API_KEY is not defined');
}

const client = new AssemblyAI({
    apiKey: apiKey
});

function msToTime(ms: number) {
    const seconds = ms / 1000;
    const minutes = Math.floor(seconds / 60); //math.floor returns the largest integer less than or equal to a given number
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export const processMeeting = async (meetingUrl: string) => { //passing meeting URL 
    const transcript = await client.transcripts.transcribe({
        audio: meetingUrl,
        auto_chapters: true,
    });

    const summaries = transcript.chapters?.map(chapter => ({
        start: msToTime(chapter.start),
        end: msToTime(chapter.end),
        gist: chapter.gist,
        headline: chapter.headline,
        summary: chapter.summary
    })) || [];
    if (!transcript.text) throw new Error("No transcript found");

    return {
        summaries
    };
};

//#testing

// const FILE_URL = 'https://assembly.ai/sports_injuries.mp3';

// const result = await processMeeting(FILE_URL);

// console.log(result);