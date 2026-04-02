"""
LLM Assessment Service.
Handles the generation of tests (MCQ, Short, Long) and strict teacher evaluation.
Uses local Ollama endpoint via our internal OllamaService.
"""
import json
from typing import Dict, List, Optional
from app.services.ollama_service import ollama_service

class AssessmentEngine:
    async def generate_test(self, source_text: str, mcq_count: int, short_count: int, long_count: int) -> Dict:
        """
        Generate a precise test based on source material and requested counts.
        """
        system_prompt = """You are an expert, rigorous academic examiner.
Your job is to generate a difficult but fair test based ONLY on the provided source material.
You must output strict JSON containing 'mcqs', 'short_answers', and 'long_answers' arrays.

Each MCQ must have:
- 'question': The question text
- 'options': An array of exactly 4 strings
- 'correct_answer': The exact string of the correct option

Each Short/Long question must have:
- 'question': The question text
- 'rubric': A brief note on what the ideal answer should contain.
"""
        
        prompt = f"""
Generate a test based on the following material:
---
{source_text[:6000]} # Truncated to fit context window
---

Requirements:
- EXACTLY {mcq_count} Multiple Choice Questions (MCQs)
- EXACTLY {short_count} Short Answer Questions
- EXACTLY {long_count} Long Answer/Essay Questions

Output ONLY valid JSON matching this schema:
{{
  "mcqs": [
    {{"question": "...", "options": ["A","B","C","D"], "correct_answer": "A"}}
  ],
  "short_answers": [
    {{"question": "...", "rubric": "Must mention X and Y."}}
  ],
  "long_answers": [
    {{"question": "...", "rubric": "Must explain X, give an example of Y, and conclude Z."}}
  ]
}}
Respond ONLY with the JSON object. No other text.
"""
        # Overriding system instruction by temporarily setting it or passing it if supported
        raw_response = await ollama_service._call_ollama(prompt, system_instruction=system_prompt)
        result = ollama_service._extract_json(raw_response)
        
        if not result:
            return {"mcqs": [], "short_answers": [], "long_answers": []}
        return result

    async def evaluate_answers(self, qa_pairs: List[Dict]) -> Dict:
        """
        Evaluate user answers against the questions acting as a strict teacher.
        qa_pairs should have {"question": "", "expected_rubric_or_answer": "", "user_answer": ""}
        """
        system_prompt = """You are a fair but thorough academic professor grading an exam.
You must analyze the user's answers against the expected rubrics.
For every answer, provide:
1. is_correct (boolean - true if marks_awarded >= 60% of max_marks)
2. marks_awarded (float, never below 0):
   - MCQ: 1 if correct answer, 0 if wrong. No partial marks.
   - Short answer (max 5 marks): Award based on percentage of key concepts covered.
     * Shows full understanding with key terms: 4-5 marks
     * Partially correct, misses some key points: 2-3 marks
     * Vague but shows some relevant knowledge: 0.5-1.5 marks
     * Completely wrong or blank: 0 marks
   - Long answer (max 10 marks): Award based on depth, structure, and coverage.
     * Excellent argument covering all rubric points: 8-10 marks
     * Good answer missing 1-2 key elements: 5-7 marks
     * Partial understanding, addresses some points: 2-4 marks
     * Very vague but attempts: 0.5-1.5 marks
     * Blank or completely off-topic: 0 marks
3. teacher_feedback: A detailed explanation of WHY marks were awarded/deducted. Point out EXACTLY what was missing and provide the correct explanation so the student can learn.

CRITICAL: Never give 0 marks if the student showed ANY genuine relevant understanding. Be constructive.

Then provide an overall 'deep_analysis' with strengths, weaknesses, and a growth trajectory.
"""

        prompt = f"""
Evaluate the following student submission.

Student Answers Payload:
{json.dumps(qa_pairs, indent=2)}

Return strict JSON matching this schema:
{{
  "evaluations": [
    {{
      "question": "...",
      "user_answer": "...",
      "is_correct": true,
      "marks_awarded": float,
      "max_marks": float,
      "teacher_feedback": "Detailed explanation..."
    }}
  ],
  "total_score": float,
  "max_score": float,
  "deep_analysis": {{
    "strengths": ["..."],
    "weaknesses": ["..."],
    "improvement_plan": "..."
  }}
}}
Respond ONLY with the JSON object. No other text.
"""
        raw_response = await ollama_service._call_ollama(prompt, system_instruction=system_prompt)
        result = ollama_service._extract_json(raw_response)
        
        if not result:
            return {
                "evaluations": [],
                "total_score": 0,
                "max_score": 0,
                "deep_analysis": {"strengths": [], "weaknesses": [], "improvement_plan": "Evaluation failed due to LLM error."}
            }
        return result

assessment_engine = AssessmentEngine()

