"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema, interviewCovers } from "@/constants/interview";
import { 
    Interview, 
    GetLatestInterviewsParams, 
    CreateFeedbackParams, 
    GetFeedbackByInterviewIdParams, 
    InterviewFeedback 
} from "@/types/interview";

// Get random interview cover image
function getRandomInterviewCover() {
    const randomIndex = Math.floor(Math.random() * interviewCovers.length);
    return interviewCovers[randomIndex];
}

// Create AI-generated feedback for an interview using LOCAL OLLAMA
export async function createInterviewFeedback(params: CreateFeedbackParams) {
    const { interviewId, odId, transcript, feedbackId } = params;

    try {
        // Handle empty transcript
        if (!transcript || transcript.length === 0) {
            console.error("No transcript provided for feedback generation");
            return { success: false, error: "No transcript" };
        }

        // Count actual user responses (not just interviewer questions)
        const userResponses = transcript.filter(
            (s: { role: string; content: string }) =>
                s.role.toLowerCase() === 'user' || s.role.toLowerCase() === 'candidate'
        );
        const hasSubstantiveAnswers = userResponses.some(
            (s: { role: string; content: string }) => s.content && s.content.trim().length > 10
        );

        console.log(`User responses count: ${userResponses.length}, Has substantive answers: ${hasSubstantiveAnswers}`);

        // If user gave no real answers, return zero scores immediately
        if (userResponses.length === 0 || !hasSubstantiveAnswers) {
            console.log("No substantive user answers detected - returning zero scores");
            const zeroFeedback = {
                interviewId: interviewId,
                userId: odId,
                totalScore: 0,
                categoryScores: [
                    { name: "Communication Skills", score: 0, comment: "No responses were provided during the interview. The candidate did not answer any questions." },
                    { name: "Technical Knowledge", score: 0, comment: "Unable to evaluate - no technical responses were given." },
                    { name: "Problem Solving", score: 0, comment: "Unable to evaluate - no problem-solving attempts were demonstrated." },
                    { name: "Cultural Fit", score: 0, comment: "Unable to evaluate - no interaction to assess cultural fit." },
                    { name: "Confidence and Clarity", score: 0, comment: "Unable to evaluate - no verbal responses provided." },
                ],
                strengths: ["None identified - no responses provided"],
                areasForImprovement: [
                    "Must provide actual answers to interview questions",
                    "Engage with the interviewer and respond to prompts",
                    "Practice answering common interview questions aloud"
                ],
                finalAssessment: "The candidate did not provide any substantive answers during this interview session. Score: 0/100. Recommendation: No Hire. The candidate must practice responding to interview questions before their next attempt.",
                createdAt: new Date().toISOString(),
            };

            let feedbackRef;
            if (feedbackId) {
                feedbackRef = db.collection("feedback").doc(feedbackId);
            } else {
                feedbackRef = db.collection("feedback").doc();
            }
            await feedbackRef.set(zeroFeedback);
            console.log("Zero-score feedback saved:", feedbackRef.id);
            return { success: true, feedbackId: feedbackRef.id };
        }

        const formattedTranscript = transcript
            .map(
                (sentence: { role: string; content: string }) =>
                    `- ${sentence.role}: ${sentence.content}\n`
            )
            .join("");

        console.log("Generating feedback with Ollama for interview:", interviewId);

        // Use environment variable or default to 127.0.0.1 for local dev (Windows)
        const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
        const ollamaModel = process.env.OLLAMA_MODEL || "qwen3:8b-q4_K_M";
        
        console.log(`[DEBUG] Interview Feedback - URL: ${ollamaUrl}, Model: ${ollamaModel}`);

        // Call local Ollama for feedback generation with CONSTRUCTIVE evaluation
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: ollamaModel,
                prompt: `You are a SUPPORTIVE, constructive senior HR interviewer. Analyze this mock interview transcript and provide encouraging, helpful feedback.

SCORING RULES:
- Be lenient. If the candidate tried and gave a partially correct answer, give them credit (60-80).
- If the answer was good with some specific examples: Score 80-95
- Only score low (0-30) if they completely avoided the question or said "I don't know".
- Focus on positive reinforcement: tell them what they did right, and then briefly explain what they missed and how to improve next time.

INTERVIEW TRANSCRIPT:
${formattedTranscript}

USER RESPONSE COUNT: ${userResponses.length} answers provided

EVALUATE EACH CATEGORY (0-100):

1. COMMUNICATION SKILLS: Did they articulate clearly?
2. TECHNICAL KNOWLEDGE: Highlight their valid technical points and briefly mention the gaps.
3. PROBLEM SOLVING: Did they show analytical thinking?
4. CULTURAL FIT: Did they show enthusiasm and professionalism?
5. CONFIDENCE & CLARITY: Were they clear and composed?

Return ONLY this JSON (no markdown, no extra text):
{
  "totalScore": <number 0-100>,
  "categoryScores": [
    {"name": "Communication Skills", "score": <0-100>, "comment": "Brief supportive feedback on their good points and mistakes..."},
    {"name": "Technical Knowledge", "score": <0-100>, "comment": "Brief supportive feedback on their good points and mistakes..."},
    {"name": "Problem Solving", "score": <0-100>, "comment": "Brief supportive feedback on their good points and mistakes..."},
    {"name": "Cultural Fit", "score": <0-100>, "comment": "Brief supportive feedback on their good points and mistakes..."},
    {"name": "Confidence and Clarity", "score": <0-100>, "comment": "Brief supportive feedback on their good points and mistakes..."}
  ],
  "strengths": ["Clear strength 1", "Clear strength 2", "Clear strength 3"],
  "areasForImprovement": ["Area 1 with encouraging tone on HOW to fix", "Area 2 with encouraging tone on HOW to fix"],
  "finalAssessment": "An encouraging overall summary. Highlight their good points and provide a gentle recommendation for improvement."
}`,
                system: "You are a supportive, insightful interview evaluator. Score gently but fairly. Give credit for effort and partial answers. Provide brief, constructive feedback that highlights what they did well and gently corrects their mistakes. Return ONLY valid JSON.",
                stream: false,
                options: {
                    temperature: 0.5, // Increased slightly for more natural encouragement
                    num_predict: 4096,
                    num_ctx: 8192,
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }

        const data = await response.json();
        let text = data.response || "";

        // Strip reasoning/thought tags from reasoning models (e.g. <think>...</think>)
        text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        // Also strip common reasoning prefixes
        text = text.replace(/^(Thinking|Reasoning):/i, "").trim();

        console.log("Ollama feedback response received (cleaned)");

        // Parse the feedback from Ollama response
        let feedbackData: any = null;
        try {
            // Try to extract JSON object from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                feedbackData = JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error("Failed to parse feedback JSON:", e);
        }

        // Use parsed data or ZERO defaults (not 70!)
        const feedback: any = {
            interviewId: interviewId,
            userId: odId,
            totalScore: feedbackData?.totalScore || 0,
            categoryScores: feedbackData?.categoryScores || [
                { name: "Communication Skills", score: 0, comment: "Could not evaluate - parsing error" },
                { name: "Technical Knowledge", score: 0, comment: "Could not evaluate - parsing error" },
                { name: "Problem Solving", score: 0, comment: "Could not evaluate - parsing error" },
                { name: "Cultural Fit", score: 0, comment: "Could not evaluate - parsing error" },
                { name: "Confidence and Clarity", score: 0, comment: "Could not evaluate - parsing error" },
            ],
            strengths: feedbackData?.strengths || ["Unable to identify - please retry"],
            areasForImprovement: feedbackData?.areasForImprovement || ["Unable to identify - please retry"],
            finalAssessment: feedbackData?.finalAssessment || "Evaluation could not be completed. Please try again.",
            transcript: transcript, // Store full transcript for Q&A review tab
            createdAt: new Date().toISOString(),
        };

        // ---- Generate Q&A breakdown with ideal answers ----
        try {
            // Extract interviewer questions and user answers from transcript
            const interviewerLines = transcript.filter(
                (s: { role: string; content: string }) => s.role === 'assistant'
            );
            const userLines = transcript.filter(
                (s: { role: string; content: string }) => s.role === 'user' || s.role === 'candidate'
            );

            if (interviewerLines.length > 0 && userLines.length > 0) {
                const qaPromptData = interviewerLines.slice(0, userLines.length).map((q: any, i: number) => ({
                    question: q.content,
                    userAnswer: userLines[i]?.content || "(no answer)"
                }));

                const qaPrompt = `You are an expert technical interviewer providing model answers.

For each question below, provide a short ideal answer that would impress an interviewer. Keep each ideal answer to 2-4 sentences. Be encouraging and educational.

Q&A PAIRS:
${qaPromptData.map((qa: any, i: number) => `${i + 1}. QUESTION: ${qa.question}\n   USER SAID: ${qa.userAnswer}`).join('\n\n')}

Return ONLY a JSON array in this exact format:
[
  {
    "question": "exact question text",
    "userAnswer": "what the candidate said",
    "idealAnswer": "the ideal 2-4 sentence answer"
  }
]`;

                const qaResponse = await fetch(`${ollamaUrl}/api/generate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: ollamaModel,
                        prompt: qaPrompt,
                        system: "You are a helpful interview coach. Return ONLY a valid JSON array with question, userAnswer, and idealAnswer fields. No markdown, no extra text.",
                        stream: false,
                        options: { temperature: 0.4, num_predict: 4096, num_ctx: 8192 }
                    }),
                });

                if (qaResponse.ok) {
                    const qaData = await qaResponse.json();
                    let qaText = qaData.response || "";
                    // Strip reasoning tags
                    qaText = qaText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
                    
                    const qaMatch = qaText.match(/\[[\s\S]*\]/);
                    if (qaMatch) {
                        feedback.qaReview = JSON.parse(qaMatch[0]);
                        console.log("Q&A review generated:", feedback.qaReview.length, "pairs");
                    }
                }
            }
        } catch (qaError) {
            console.error("Q&A review generation failed (non-fatal):", qaError);
            // Non-fatal: feedback page will hide the tab if qaReview is absent
        }

        let feedbackRef;

        if (feedbackId) {
            feedbackRef = db.collection("feedback").doc(feedbackId);
        } else {
            feedbackRef = db.collection("feedback").doc();
        }

        await feedbackRef.set(feedback);
        console.log("Feedback saved with Ollama:", feedbackRef.id);

        return { success: true, feedbackId: feedbackRef.id };
    } catch (error: any) {
        console.error("Error saving feedback:", error?.message || error);

        // Check if Ollama is not running
        if (error?.message?.includes("ECONNREFUSED") || error?.message?.includes("fetch failed")) {
            return { success: false, error: "Ollama is not running. Please start Ollama with 'ollama serve'" };
        }

        return { success: false, error: error?.message };
    }
}

// Get interview by ID
export async function getInterviewById(id: string): Promise<Interview | null> {
    try {
        const interview = await db.collection("interviews").doc(id).get();
        if (!interview.exists) return null;
        return { id: interview.id, ...interview.data() } as Interview;
    } catch (error) {
        console.error("Error getting interview:", error);
        return null;
    }
}

// Get feedback by interview ID and user
export async function getFeedbackByInterviewId(
    params: GetFeedbackByInterviewIdParams
): Promise<InterviewFeedback | null> {
    const { interviewId, odId } = params;

    try {
        // Use 'userId' field and 'feedback' collection to match original
        const querySnapshot = await db
            .collection("feedback")
            .where("interviewId", "==", interviewId)
            .where("userId", "==", odId)
            .limit(1)
            .get();

        if (querySnapshot.empty) return null;

        const feedbackDoc = querySnapshot.docs[0];
        return { id: feedbackDoc.id, ...feedbackDoc.data() } as InterviewFeedback;
    } catch (error) {
        console.error("Error getting feedback:", error);
        return null;
    }
}

// Get latest available interviews (not by current user)
export async function getLatestInterviews(
    params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
    const { odId, limit = 20 } = params;

    try {
        // Simple query without complex filters that require composite indexes
        const interviews = await db
            .collection("interviews")
            .where("finalized", "==", true)
            .limit(50)
            .get();

        // Filter and sort client-side to avoid composite index requirement
        // Use 'userId' field to match original data structure
        const filtered = interviews.docs
            .map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
            } as Interview))
            .filter((interview: Interview) => interview.userId !== odId)
            .sort((a: Interview, b: Interview) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, limit);

        return filtered;
    } catch (error) {
        console.error("Error getting latest interviews:", error);
        return [];
    }
}

// Get user's own interviews
export async function getInterviewsByUserId(
    odId: string
): Promise<Interview[] | null> {
    try {
        // Use 'userId' field to match original data structure
        const interviews = await db
            .collection("interviews")
            .where("userId", "==", odId)
            .get();

        // Sort client-side
        const sorted = interviews.docs
            .map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
            } as Interview))
            .sort((a: Interview, b: Interview) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

        return sorted;
    } catch (error) {
        console.error("Error getting user interviews:", error);
        return [];
    }
}

// Generate interview questions ONLY (no save)
export async function generateInterviewQuestions(params: {
    type: string;
    role: string;
    level: string;
    techstack: string;
    amount: number;
}) {
    const { type, role, level, techstack, amount } = params;

    try {
        // Use environment variable or default to 127.0.0.1 (Windows)
        const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
        const ollamaModel = process.env.OLLAMA_MODEL || "qwen3:8b-q4_K_M";
        
        console.log(`[DEBUG] Interview Question Gen - URL: ${ollamaUrl}, Model: ${ollamaModel}`);

        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: ollamaModel,
                think: false, // Turn off chain-of-thought to make it instant for questions
                prompt: `You are an expert interview question generator. Generate exactly ${amount} interview questions.

The job role is: ${role}
The experience level is: ${level}
The tech stack/skills are: ${techstack}
The interview type is: ${type} (Technical = coding/system questions, Behavioral = soft skills, Mixed = both)

IMPORTANT RULES:
- Generate exactly ${amount} questions
- Questions should be appropriate for the experience level
- For Technical: include coding, system design, or technical problem-solving
- For Behavioral: include teamwork, leadership, conflict resolution
- Questions must be clear and suitable for voice AI to read aloud
- Do NOT use special characters like * / # or markdown

Return ONLY a valid JSON array of questions, no other text:
["Question 1?", "Question 2?", "Question 3?"]`,
                system: "You are a professional interview question generator. Return ONLY valid JSON arrays. No explanations, no markdown, just the JSON array.",
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 2048,
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }

        const data = await response.json();
        let text = data.response || "";
        
        // Strip reasoning/thought tags
        text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

        console.log("Ollama question generation response (cleaned):", text);

        let questions: string[] = [];
        try {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                questions = JSON.parse(jsonMatch[0]);
            } else {
                questions = text
                    .split('\n')
                    .map((line: string) => line.replace(/^[\d\.\-\*]+\s*/, '').trim())
                    .filter((q: string) => q.length > 10 && q.includes('?'));
            }
        } catch (e) {
            console.error("Failed to parse questions:", e);
            questions = [
                `Tell me about your experience with ${techstack}.`,
                `How would you approach a ${type.toLowerCase()} challenge in your ${role} role?`,
                `What are your strengths and weaknesses as a ${level} ${role}?`,
            ];
        }

        if (questions.length === 0) {
            questions = [
                `Tell me about your experience with ${techstack}.`,
                `What makes you a good fit for a ${role} position?`,
                `Describe a challenging project you worked on.`,
            ];
        }

        // Limit to requested amount if we parsed too many
        return { success: true, questions: questions.slice(0, amount) };

    } catch (error: any) {
        console.error("Error generating questions:", error?.message || error);
        if (error?.message?.includes("ECONNREFUSED") || error?.message?.includes("fetch failed")) {
            return { success: false, error: "Ollama is not running. Please start Ollama with 'ollama serve'" };
        }
        return { success: false, error: error?.message };
    }
}

// Save the final interview (after user edits)
export async function createInterview(params: {
    type: string;
    role: string;
    level: string;
    techstack: string;
    questions: string[];
    odId: string;
}) {
    const { type, role, level, techstack, questions, odId } = params;

    try {
        const interview = {
            role: role,
            type: type,
            level: level,
            techstack: techstack.split(",").map((t) => t.trim()),
            questions: questions,
            userId: odId,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection("interviews").add(interview);
        console.log("Interview created:", docRef.id);

        return { success: true, interviewId: docRef.id };
    } catch (error: any) {
        console.error("Error creating interview:", error);
        return { success: false, error: error?.message };
    }
}

// Delete an interview and all its associated feedback
export async function deleteInterview(interviewId: string, userId: string) {
    try {
        const interviewDoc = await db.collection("interviews").doc(interviewId).get();
        if (!interviewDoc.exists) {
            return { success: false, error: "Interview not found" };
        }

        const data = interviewDoc.data();
        if (data?.userId !== userId) {
            return { success: false, error: "Unauthorized to delete this interview" };
        }

        const feedbackSnapshot = await db.collection("feedback").where("interviewId", "==", interviewId).get();
        
        const batch = db.batch();
        batch.delete(db.collection("interviews").doc(interviewId));
        feedbackSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));

        await batch.commit();
        console.log("Deleted interview and associated feedback for:", interviewId);

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting interview:", error);
        return { success: false, error: error?.message };
    }
}
