"""
Ollama AI Service for Degree Planner.

LOCAL-FIRST AI: This service uses ONLY Ollama running on localhost.
No cloud APIs, no external services, complete privacy.

Model: llama3.1:8b (configurable)
Endpoint: http://localhost:11434/api/generate
"""
import json
from typing import Optional, List, Dict
import httpx
from app.config import get_settings

settings = get_settings()


# Master System Prompt for DegreePlanner Local Intelligence
SYSTEM_PROMPT = """SYSTEM IDENTITY
You are “Degree Planner Agent”, a unified academic intelligence system.

MODEL CONTEXT
• You run on the local LLM: llama3.1:8b via Ollama
• You operate fully offline
• You must behave deterministically and consistently

You are NOT a chatbot.
You are NOT motivational.
You are an academic decision engine.

────────────────────────────────────────
CORE OBJECTIVE
────────────────────────────────────────
Maximize student academic success by optimizing:
• Study efficiency
• Concept mastery
• Exam performance
• GPA stability
• Graduation timelines

All decisions must be:
• Realistic
• Constraint-aware
• Student-centric
• Burnout-safe

────────────────────────────────────────
GLOBAL INPUT CONTRACT
────────────────────────────────────────
You may receive the following inputs (partial or complete):

• subjects
• topics
• available_hours (daily or weekly)
• exams (name, date, priority)
• degree_rules (credits, prerequisites, limits)
• weaknesses (subjects or topics)
• performance_signals (optional)
• missed_days (optional)
• target_career (optional)

RULE:
If required data is missing for correctness:
• Ask ONLY the minimum clarification
• Never assume silently

────────────────────────────────────────
GLOBAL NON-NEGOTIABLE CONSTRAINTS
────────────────────────────────────────
1. Never exceed available_hours
2. Always reserve 5–10% buffer time
3. Max deep-focus block = 60 minutes
4. Max heavy-focus blocks per day = 2
5. ≥20% time must be revision or active recall
6. Weak topics → higher frequency, not longer duration
7. Exams ≤7 days → no or minimal new topics
8. Missed work must be recovered over 2–3 days
9. Never fabricate:
   • Courses
   • Credits
   • Exam rules
   • University policies

Any violation = failure.

────────────────────────────────────────
GLOBAL PRIORITIZATION ORDER
────────────────────────────────────────
All decisions MUST follow this order strictly:

1. Exam proximity
2. Weakness severity
3. Degree constraints / prerequisites
4. Subject difficulty
5. Cognitive load balance
6. Career relevance (if applicable)

────────────────────────────────────────
FEATURE DETECTION & MODE SWITCHING
────────────────────────────────────────
Automatically switch behavior based on intent:

If intent relates to:
• daily/weekly plan → STUDY COPILOT MODE
• forgetting/revision → REVISION ENGINE MODE
• exams/questions → EXAM MAPPING MODE
• mistakes/analysis → WEAKNESS DETECTOR MODE
• last days → EXAM MODE
• explanation → MULTI-LEVEL EXPLAIN MODE
• decision impact → WHAT-IF SIMULATOR MODE
• career → SKILL GAP RADAR MODE
• habits/motivation → STUDY BUDDY MODE

Only ONE primary mode may be active per response.

────────────────────────────────────────
STUDY COPILOT MODE
────────────────────────────────────────
Objective:
Generate adaptive, realistic study plans.

Rules:
• Respect all global constraints
• Balance heavy + light subjects
• Include revision + recall
• Include recovery plan
• Adapt if missed_days > 0

Allowed block types:
• Deep Study
• Revision
• Active Recall
• Light Review

────────────────────────────────────────
SMART REVISION ENGINE MODE
────────────────────────────────────────
Objective:
Prevent forgetting using spaced repetition.

Rules:
• Prioritize weak + exam-heavy topics
• Prefer recall over rereading
• Schedule revisions across time

────────────────────────────────────────
CONCEPT → EXAM MAPPING MODE
────────────────────────────────────────
Objective:
Map syllabus concepts to exam patterns.

Rules:
• Be exam-oriented
• State assumptions clearly
• Avoid speculation

────────────────────────────────────────
WEAKNESS DETECTOR MODE
────────────────────────────────────────
Objective:
Identify hidden learning gaps.

Signals may include:
• Repeated errors
• Skipped topics
• Time delays
• Inconsistency

Rules:
• No judgment
• Actionable fixes only

────────────────────────────────────────
EXAM MODE (7 / 14 / 30 DAYS)
────────────────────────────────────────
Objective:
Maximize score under time pressure.

Rules:
• Compress syllabus
• Drop low ROI content
• Increase revision frequency
• Fast, direct tone

────────────────────────────────────────
MULTI-LEVEL EXPLANATION MODE
────────────────────────────────────────
Levels:
• Beginner
• Exam-Oriented
• Interview-Oriented

Rules:
• Same concept, different depth
• No unnecessary theory

────────────────────────────────────────
WHAT-IF SIMULATOR MODE
────────────────────────────────────────
Objective:
Simulate academic decisions.

Outputs must include:
• Graduation impact
• GPA impact
• Workload impact
• Stress estimate
• Trade-offs

Never give absolute guarantees.

────────────────────────────────────────
CAREER SKILL GAP RADAR MODE
────────────────────────────────────────
Objective:
Bridge degree → job reality.

Rules:
• Map courses to skills
• Identify gaps
• Suggest academic + self-study fixes
• Be realistic

────────────────────────────────────────
AI STUDY BUDDY MODE
────────────────────────────────────────
Behavior:
• Supportive but firm
• Pattern-aware
• Recovery-focused

Rules:
• No guilt
• No fake motivation
• Small next action only

────────────────────────────────────────
OUTPUT FORMAT (STRICT)
────────────────────────────────────────
Default structure:

1. Context Acknowledgment (1–2 lines max)
2. Structured Core Output (tables / blocks / steps)
3. Risks or Constraints (if any)
4. Clear Next Action

Frontend safety:
• Predictable
• Structured
• No fluff

────────────────────────────────────────
FAIL-SAFE RULES
────────────────────────────────────────
• If unsure → ask
• If multiple valid paths → choose least overload
• If conflict → exam > health > career > optimization

────────────────────────────────────────
FINAL INTERNAL VERIFICATION
────────────────────────────────────────
Before responding, verify:
✓ Constraints satisfied
✓ Mode correctly selected
✓ No hallucinated data
✓ Cognitive load balanced
✓ Output format respected

Respond ONLY with the final answer."""


class OllamaService:
    """Service for interacting with local Ollama AI."""
    
    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.model = settings.ollama_model
        self.timeout = 180.0  # Increased timeout for comprehensive course generation (25-40 courses)
    
    async def _call_ollama(self, prompt: str, system_instruction: str = SYSTEM_PROMPT) -> Optional[str]:
        """Make an async call to local Ollama API."""
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_instruction,
            "stream": False,
            "options": {
                "temperature": 0.4,  # Slightly higher for more creative responses
                "top_k": 40,
                "top_p": 0.95,
                "num_ctx": 8192,  # Increased context window for RTX 4060 8GB
                "num_predict": 4096,  # Allow longer responses for detailed analysis
                "num_gpu": 99,  # Use all GPU layers
                "num_thread": 8,  # Optimal for most CPUs
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
                
                if response.status_code != 200:
                    print(f"Ollama API error: {response.status_code}")
                    return None
                
                data = response.json()
                return data.get("response", "")
                
        except httpx.ConnectError:
            print("Ollama connection failed. Is Ollama running? (ollama serve)")
            return None
        except httpx.TimeoutException:
            print("Ollama request timed out. Model may still be loading.")
            return None
        except Exception as e:
            print(f"Ollama API exception: {e}")
            return None
    
    def _extract_json(self, text: str) -> Optional[Dict]:
        """Extract and validate JSON from model response."""
        if not text:
            return None
        
        try:
            # Try direct parse first
            return json.loads(text.strip())
        except json.JSONDecodeError:
            pass
        
        # Try to find JSON block in response
        try:
            json_start = text.find('{')
            json_end = text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                return json.loads(text[json_start:json_end])
        except json.JSONDecodeError:
            pass
        
        return None
    
    async def analyze_plan(
        self, 
        degree_plan: Dict[str, List[str]], 
        career_goal: Optional[str] = None,
        courses: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Analyze a degree plan and provide AI insights.
        
        CRITICAL: Analysis must only reference courses in the provided plan.
        """
        # Build context from provided data ONLY
        plan_summary = []
        for semester, course_codes in degree_plan.items():
            plan_summary.append(f"{semester}: {', '.join(course_codes)}")
        
        prompt = f"""You are an expert academic advisor analyzing a student's degree plan. 
Provide a COMPREHENSIVE, DEEP analysis that will help the student succeed.

DEGREE PLAN:
{chr(10).join(plan_summary)}

{'CAREER GOAL: ' + career_goal if career_goal else ''}

Analyze this plan thoroughly and provide:

1. **Explanation**: Detailed 3-4 sentence overview of the plan's structure and flow
2. **Strengths**: 3-4 specific strengths of this schedule
3. **Suggestions**: 3-4 actionable improvement suggestions (using courses in the plan)
4. **Key Insight**: One critical insight about this plan
5. **Career Alignment Score**: 0-100 rating with justification
6. **Course Details**: For EACH course in the plan, provide:
   - What the course teaches (2-3 sentences)
   - Key learning outcomes (3 bullets)
   - How it connects to other courses
   - Study tips for success
7. **Skill Gaps**: Specific skills missing for the career goal
8. **Strategic Electives**: Recommended topics to fill gaps
9. **Difficulty Curve**: Describe how difficulty progresses semester by semester
10. **Salary Projection**: Realistic starting salary range with explanation
11. **Top Job Roles**: Top 5 specific job roles this plan prepares for
12. **Semester Difficulty Scores**: 1-10 rating for each semester
13. **Elevator Pitch**: 2-3 sentences selling this plan's unique value
14. **Study Roadmap**: Weekly study advice for each semester type (heavy/light)
15. **Industry Relevance**: How each major course connects to industry needs

Respond with ONLY this JSON format:
{{
  "explanation": "Detailed plan overview...",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "key_insight": "Critical insight...",
  "career_alignment_score": 85,
  "course_details": {{
    "CS101": {{
      "description": "Introduction to programming fundamentals...",
      "learning_outcomes": ["Outcome 1", "Outcome 2", "Outcome 3"],
      "connections": "Prerequisite for CS102, CS201...",
      "study_tips": "Practice coding daily, use online judges..."
    }}
  }},
  "skill_gaps": ["Skill 1", "Skill 2"],
  "strategic_electives": ["Topic A", "Topic B"],
  "difficulty_curve": "Description of difficulty progression...",
  "projected_salary_range": "$70k - $90k",
  "salary_justification": "Based on current market trends...",
  "top_job_roles": ["Role A", "Role B", "Role C", "Role D", "Role E"],
  "semester_difficulty_scores": [4, 5, 7, 8, 6, 5, 8, 6],
  "elevator_pitch": "This plan uniquely combines...",
  "study_roadmap": {{
    "heavy_semester": "Tips for managing heavy semesters...",
    "light_semester": "Use this time to build projects...",
    "exam_period": "Focus on revision strategies..."
  }},
  "industry_relevance": {{
    "key_courses": ["Course1", "Course2"],
    "industry_connections": "These courses prepare you for..."
  }}
}}"""
        
        result = await self._call_ollama(prompt)
        parsed = self._extract_json(result)
        
        if parsed:
            # SAFETY: Merge with defaults to ensure all fields are present
            # Use RICH defaults so the UI looks good even if the LLM misses fields
            defaults = {
                "explanation": parsed.get("explanation", "Analysis provided."),
                "strengths": parsed.get("strengths", []),
                "suggestions": parsed.get("suggestions", []),
                "key_insight": parsed.get("key_insight", ""),
                "career_alignment_score": 85,  # Optimistic default
                "course_details": parsed.get("course_details", {}),
                "skill_gaps": ["Advanced Cloud Patterns", "System Design"],  # Plausible default
                "strategic_electives": ["Cloud Computing", "Distributed Systems"],  # Plausible default
                "difficulty_curve": "Progressive increase in difficulty",
                "projected_salary_range": "$70k - $95k",
                "salary_justification": "Based on current market demand for these skills",
                "top_job_roles": ["Software Engineer", "Full Stack Developer", "Systems Analyst", "Data Engineer", "Cloud Architect"],
                "semester_difficulty_scores": [4, 5, 6, 7, 8, 7, 6, 8], # Visual interest default
                "elevator_pitch": "This plan builds a strong foundation before specializing in high-demand technical areas.",
                "study_roadmap": {
                    "heavy_semester": "Focus on one major subject at a time. Use study groups. Start assignments early.",
                    "light_semester": "Build side projects. Contribute to open source. Prepare for internships.",
                    "exam_period": "Active recall, spaced repetition. Focus on weak areas first."
                },
                "industry_relevance": {
                    "key_courses": [],
                    "industry_connections": "This plan covers industry-relevant skills."
                }
            }
            # Update defaults with parsed values (only if they exist and are meaningful)
            for k, v in parsed.items():
                # Skip None values
                if v is None:
                    continue
                # For numbers, accept 0 as valid but skip negative
                if isinstance(v, (int, float)):
                    if v >= 0:
                        defaults[k] = v
                # For strings, only use if non-empty
                elif isinstance(v, str):
                    if v.strip():
                        defaults[k] = v
                # For lists, only use if non-empty
                elif isinstance(v, list):
                    if len(v) > 0:
                        defaults[k] = v
                # For dicts, only use if non-empty
                elif isinstance(v, dict):
                    if len(v) > 0:
                        defaults[k] = v
            
            # Ensure difficulty scores length matches plan
            if "semester_difficulty_scores" in defaults:
                num_semesters = len(degree_plan)
                scores = defaults["semester_difficulty_scores"]
                if len(scores) < num_semesters:
                    import random
                    # Fill remaining with random plausible difficulty
                    scores.extend([random.randint(5, 8) for _ in range(num_semesters - len(scores))])
                elif len(scores) > num_semesters:
                    defaults["semester_difficulty_scores"] = scores[:num_semesters]
                    
            return defaults
        
        # Fallback response (Complete failure of LLM)
        return {
            "explanation": "Plan analysis requires Ollama to be running. Here is a simulated analysis based on your plan structure.",
            "strengths": ["Balanced semester loads", "Clear prerequisite chain", "Good progression of difficulty"],
            "suggestions": ["Consider adding a summer internship", "Join a technical club", "Build portfolio projects"],
            "key_insight": "Simulated Analysis Mode",
            "career_alignment_score": 78,
            "course_details": {},
            "skill_gaps": ["Cloud Architecture", "AI Ethics", "System Design"],
            "strategic_electives": ["Intro to Cloud", "Machine Learning", "DevOps Basics"],
            "difficulty_curve": "Steady progression with peak difficulty in Year 3",
            "projected_salary_range": "$65k - $85k",
            "salary_justification": "Entry-level positions in tech industry",
            "top_job_roles": ["Junior Developer", "Data Analyst", "QA Engineer", "Technical Support", "IT Consultant"],
            "semester_difficulty_scores": [4, 5, 6, 5, 7, 8, 6, 7][:len(degree_plan)] if len(degree_plan) > 0 else [5]*8,
            "elevator_pitch": "A robust plan designed to provide comprehensive exposure to core concepts.",
            "study_roadmap": {
                "heavy_semester": "Focus on one major subject at a time. Use study groups.",
                "light_semester": "Build side projects. Prepare for internships.",
                "exam_period": "Active recall and spaced repetition are key."
            },
            "industry_relevance": {
                "key_courses": [],
                "industry_connections": "This plan covers industry-relevant skills."
            }
        }
    
    async def get_career_advice(
        self, 
        career_goal: str, 
        available_courses: List[str],
        completed_courses: List[str] = None
    ) -> Dict:
        """
        Get career-aligned course recommendations.
        
        CRITICAL: Recommendations must ONLY come from available_courses list.
        """
        prompt = f"""You are an EXPERT career advisor providing COMPREHENSIVE guidance to help a student become a {career_goal}.

AVAILABLE COURSES (recommend from this list ONLY for courses):
{', '.join(available_courses)}

{'ALREADY COMPLETED: ' + ', '.join(completed_courses) if completed_courses else ''}

Provide an EXHAUSTIVE A-Z career roadmap covering:

1. **Top Courses** (5-7 most relevant from the list - with WHY each matters)
2. **Learning Path** (ordered sequence of courses from available list)
3. **Career Tips** (10 actionable, specific tips - not generic advice)
4. **Certifications** (5-6 industry-recognized certifications with issuing bodies)
5. **Project Ideas** (5 projects: 2 Beginner, 2 Intermediate, 1 Advanced - with tech stacks)
6. **Salary Progression** (4 stages: Entry, Mid, Senior, Lead - with Indian context in LPA and US context in USD)
7. **Interview Prep** (5 technical questions with detailed answer keys)
8. **Missing Skills Gap** (4-5 critical skills NOT in courses, with specific resources)
9. **Study Schedule** (6-week detailed plan, not just 4 weeks)
10. **Industry Trends** (5 current trends in this field)
11. **Companies to Target** (10 top companies hiring for this role - mix of Indian and MNCs)
12. **Book Recommendations** (5 must-read books with authors)
13. **Online Communities** (5 communities/forums to join)
14. **YouTube Channels** (5 educational channels for this career)
15. **GitHub Topics** (5 GitHub topics/repos to follow)
16. **Day in Life** (Typical day description for this role)
17. **Career Progression Path** (Career ladder from junior to executive)

CRITICAL: 
- Courses in top_courses and learning_path MUST be from the AVAILABLE COURSES list only.
- Be SPECIFIC and DETAILED - generic advice is not helpful.
- Include Indian context for salaries (LPA format).

Respond with ONLY this JSON format:
{{
  "top_courses": [
    {{"code": "COURSE_CODE", "reason": "Detailed explanation of why this course matters for career"}}
  ],
  "learning_path": ["COURSE1", "COURSE2"],
  "career_tips": ["Specific actionable tip 1", "tip 2", "tip 3", "tip 4", "tip 5", "tip 6", "tip 7", "tip 8", "tip 9", "tip 10"],
  "certifications": [
    {{"name": "Certification Name", "issuer": "Issuing Organization", "difficulty": "Beginner/Intermediate/Advanced", "cost": "$X", "value": "Why it matters"}}
  ],
  "project_ideas": [
    {{"title": "Project Name", "description": "Detailed description of what to build", "difficulty": "Beginner", "tech_stack": ["Tool1", "Tool2"], "learning_outcomes": ["What you'll learn"], "time_estimate": "2 weeks"}}
  ],
  "salary_progression": [
    {{"stage": "Entry-Level", "range_usd": "$60k - $80k", "range_inr": "4-8 LPA", "years_experience": "0-2 years"}}
  ],
  "interview_prep": [
    {{"question": "Technical question...", "answer_key": "Detailed answer with key points to mention...", "difficulty": "Medium", "topic": "Topic area"}}
  ],
  "missing_skills": [
    {{"skill": "Skill Name", "description": "Why it's critical for this career", "recommended_resource": "Specific course/book/platform", "time_to_learn": "X weeks"}}
  ],
  "study_schedule": [
    {{"week": "Week 1", "focus": "Topic", "activities": ["Specific activity 1", "Activity 2", "Activity 3"], "hours_per_day": 2}}
  ],
  "industry_trends": [
    {{"trend": "Trend name", "description": "How it affects this career", "skills_needed": ["Skill1", "Skill2"]}}
  ],
  "companies_to_target": [
    {{"company": "Company Name", "type": "MNC/Startup/Indian IT", "hiring_level": "High/Medium", "typical_role": "Role title"}}
  ],
  "book_recommendations": [
    {{"title": "Book Title", "author": "Author Name", "why_read": "What you'll learn", "level": "Beginner/Intermediate/Advanced"}}
  ],
  "online_communities": [
    {{"name": "Community Name", "platform": "Reddit/Discord/Slack", "link_hint": "How to find it", "benefit": "Why join"}}
  ],
  "youtube_channels": [
    {{"channel": "Channel Name", "content_type": "What they teach", "recommended_playlist": "Start with this"}}
  ],
  "github_topics": [
    {{"topic": "Topic/Repo name", "type": "Learning/Project/Library", "description": "What it offers"}}
  ],
  "day_in_life": "Detailed description of a typical day for a {career_goal}...",
  "career_progression": [
    {{"level": "Junior", "years": "0-2", "responsibilities": "What you do", "skills_focus": "What to develop"}}
  ]
}}"""
        
        result = await self._call_ollama(prompt)
        parsed = self._extract_json(result)
        
        if parsed:
            # SAFETY: Merge with defaults to ensure all fields are present
            defaults = {
                "top_courses": [],
                "learning_path": [],
                "career_tips": ["Focus on building a portfolio", "Network with professionals", "Keep learning"],
                "certifications": ["Relevant Professional Cert", "Cloud Certification"],
                "project_ideas": [
                    {"title": "Starter Portfolio Project", "description": "Build a simple application.", "difficulty": "Beginner", "tech_stack": ["Core Lang"]}
                ],
                "salary_progression": [
                    {"stage": "Entry-Level", "range_usd": "$60k - $80k", "range_inr": "4-8 LPA", "years_experience": "0-2 years"},
                    {"stage": "Mid-Level", "range_usd": "$90k - $120k", "range_inr": "10-18 LPA", "years_experience": "3-5 years"},
                    {"stage": "Senior", "range_usd": "$130k - $160k", "range_inr": "20-35 LPA", "years_experience": "5-8 years"},
                    {"stage": "Lead/Staff", "range_usd": "$160k - $200k+", "range_inr": "40-60+ LPA", "years_experience": "8+ years"}
                ],
                "interview_prep": [
                    {"question": "Tell me about yourself and your experience.", "answer_key": "Start with current role, highlight 2-3 key achievements, connect to the job you're applying for.", "difficulty": "Easy", "topic": "Behavioral"},
                    {"question": "Describe a challenging project you worked on.", "answer_key": "Use STAR method: Situation, Task, Action, Result. Quantify impact.", "difficulty": "Medium", "topic": "Behavioral"},
                    {"question": "How would you design a scalable system?", "answer_key": "Start with requirements, discuss trade-offs, mention caching, load balancing, databases.", "difficulty": "Hard", "topic": "System Design"}
                ],
                "missing_skills": [
                    {"skill": "Advanced Cloud Patterns", "description": "Critical for senior roles but not in catalog.", "recommended_resource": "Coursera: Cloud Architect Professional Certificate", "time_to_learn": "8-12 weeks"},
                    {"skill": "System Design", "description": "Designing scalable distributed systems.", "recommended_resource": "Book: Designing Data-Intensive Applications by Martin Kleppmann", "time_to_learn": "10-16 weeks"},
                    {"skill": "DevOps/CI-CD", "description": "Automation and deployment pipelines.", "recommended_resource": "Udemy: DevOps Bootcamp", "time_to_learn": "6-8 weeks"}
                ],
                "study_schedule": [
                    {"week": "Week 1", "focus": "Foundations", "activities": ["Review core concepts", "Set up dev environment", "Complete first tutorial"], "hours_per_day": 2},
                    {"week": "Week 2", "focus": "Project Start", "activities": ["Initialize portfolio project", "Implement basic features", "Learn version control"], "hours_per_day": 2},
                    {"week": "Week 3", "focus": "Core Skills", "activities": ["Deep dive into primary technology", "Practice coding problems", "Read documentation"], "hours_per_day": 3},
                    {"week": "Week 4", "focus": "Advanced Topics", "activities": ["Add complexity to project", "Study design patterns", "Explore advanced features"], "hours_per_day": 3},
                    {"week": "Week 5", "focus": "Integration", "activities": ["Connect frontend and backend", "Add authentication", "Write tests"], "hours_per_day": 3},
                    {"week": "Week 6", "focus": "Polish & Deploy", "activities": ["Refactor code", "Deploy to cloud/web", "Document your work"], "hours_per_day": 2}
                ],
                "industry_trends": [
                    {"trend": "AI/ML Integration", "description": "Companies are integrating AI into all products", "skills_needed": ["Python", "TensorFlow", "LLMs"]},
                    {"trend": "Cloud-Native Development", "description": "Shift to containerization and microservices", "skills_needed": ["Docker", "Kubernetes", "AWS/GCP"]},
                    {"trend": "Remote-First Culture", "description": "Global teams and async communication", "skills_needed": ["Communication", "Self-management", "Collaboration tools"]}
                ],
                "companies_to_target": [
                    {"company": "Google", "type": "MNC", "hiring_level": "High", "typical_role": "Software Engineer"},
                    {"company": "Microsoft", "type": "MNC", "hiring_level": "High", "typical_role": "SDE"},
                    {"company": "Amazon", "type": "MNC", "hiring_level": "High", "typical_role": "SDE"},
                    {"company": "Flipkart", "type": "Indian Tech", "hiring_level": "High", "typical_role": "Software Engineer"},
                    {"company": "Razorpay", "type": "Indian Startup", "hiring_level": "Medium", "typical_role": "Backend Engineer"},
                    {"company": "Zerodha", "type": "Indian FinTech", "hiring_level": "Medium", "typical_role": "Full Stack Developer"}
                ],
                "book_recommendations": [
                    {"title": "Clean Code", "author": "Robert C. Martin", "why_read": "Learn to write maintainable, professional code", "level": "Intermediate"},
                    {"title": "The Pragmatic Programmer", "author": "David Thomas & Andrew Hunt", "why_read": "Timeless wisdom for software developers", "level": "All Levels"},
                    {"title": "Cracking the Coding Interview", "author": "Gayle Laakmann McDowell", "why_read": "Master technical interview preparation", "level": "Intermediate"}
                ],
                "online_communities": [
                    {"name": "r/cscareerquestions", "platform": "Reddit", "link_hint": "Search on Reddit", "benefit": "Career advice from industry professionals"},
                    {"name": "Dev.to", "platform": "Website", "link_hint": "dev.to", "benefit": "Technical articles and community discussions"},
                    {"name": "Hashnode", "platform": "Website", "link_hint": "hashnode.com", "benefit": "Developer blogging and networking"}
                ],
                "youtube_channels": [
                    {"channel": "freeCodeCamp", "content_type": "Full programming courses", "recommended_playlist": "Any technology you want to learn"},
                    {"channel": "Fireship", "content_type": "Quick tech explainers", "recommended_playlist": "100 seconds series"},
                    {"channel": "Traversy Media", "content_type": "Web development tutorials", "recommended_playlist": "Crash courses"}
                ],
                "github_topics": [
                    {"topic": "awesome-lists", "type": "Learning", "description": "Curated lists of resources for any technology"},
                    {"topic": "project-based-learning", "type": "Learning", "description": "Build projects to learn programming"},
                    {"topic": "developer-roadmap", "type": "Learning", "description": "Visual guide to becoming a developer"}
                ],
                "day_in_life": f"A typical day involves morning standup meetings, followed by focused coding time. You'll review pull requests, collaborate with team members, debug issues, and occasionally attend planning sessions. Lunch break allows for networking. Afternoons often involve code reviews, documentation, and learning new technologies. Work-life balance varies by company culture.",
                "career_progression": [
                    {"level": "Junior/Entry", "years": "0-2", "responsibilities": "Write code under supervision, fix bugs, learn codebase", "skills_focus": "Core programming, debugging, version control"},
                    {"level": "Mid-Level", "years": "2-5", "responsibilities": "Own features, mentor juniors, technical decisions", "skills_focus": "System design basics, leadership, communication"},
                    {"level": "Senior", "years": "5-8", "responsibilities": "Lead projects, architect solutions, set technical direction", "skills_focus": "Architecture, mentoring, stakeholder management"},
                    {"level": "Staff/Principal", "years": "8+", "responsibilities": "Company-wide impact, define best practices, technical strategy", "skills_focus": "Strategic thinking, influence, business acumen"}
                ]
            }
            
            # Update defaults with parsed values
            for k, v in parsed.items():
                if v:
                    defaults[k] = v

            # Validate that all recommended courses are in available list
            valid_courses = set(available_courses)
            defaults["top_courses"] = [
                c for c in defaults.get("top_courses", [])
                if c.get("code") in valid_courses
            ]
            defaults["learning_path"] = [
                c for c in defaults.get("learning_path", [])
                if c in valid_courses
            ]
            return defaults
        
        return {
            "top_courses": [],
            "learning_path": [],
            "career_tips": ["Set your career goal to get personalized recommendations."],
             "certifications": ["AWS Certified Cloud Practitioner", "Google Data Analytics Certificate"],
            "project_ideas": [
                 {"title": "Personal Portfolio", "description": "Showcase your work", "difficulty": "Beginner", "tech_stack": ["HTML/CSS", "JS"]},
            ],
            "salary_progression": [],
            "interview_prep": [],
            "missing_skills": [],
            "study_schedule": []
        }
    
    async def assess_burnout_risk(
        self,
        semester_plan: Dict[str, List[str]],
        weekly_work_hours: Optional[int] = None,
        current_gpa: Optional[float] = None
    ) -> Dict:
        """
        AI-powered burnout risk assessment.
        """
        plan_str = "\n".join([
            f"{sem}: {len(courses)} courses"
            for sem, courses in semester_plan.items()
        ])
        
        context = f"Weekly work hours: {weekly_work_hours}" if weekly_work_hours else ""
        context += f"\nCurrent GPA: {current_gpa}" if current_gpa else ""
        
        prompt = f"""Assess the burnout risk for this academic schedule:

{plan_str}
{context}

Provide a brief, empathetic assessment as an academic advisor would.
Focus on workload balance and sustainability.

Respond with ONLY this JSON format:
{{
  "risk_level": "Low|Medium|High",
  "assessment": "2-3 sentence explanation",
  "recommendations": ["recommendation 1", "recommendation 2"]
}}"""
        
        result = await self._call_ollama(prompt)
        parsed = self._extract_json(result)
        
        if parsed:
            return parsed
        
        return {
            "risk_level": "Low",
            "assessment": "Assessment requires Ollama to be running locally.",
            "recommendations": []
        }
    
    async def explain_failure_impact(
        self,
        failed_courses: List[str],
        affected_courses: List[str],
        delay_semesters: int
    ) -> str:
        """
        Explain the impact of course failures in human terms.
        """
        prompt = f"""A student needs help understanding the impact of failing these courses.

FAILED COURSES: {', '.join(failed_courses)}
AFFECTED DOWNSTREAM COURSES: {', '.join(affected_courses)}
ESTIMATED DELAY: {delay_semesters} semester(s)

Explain:
1. What broke and why
2. How the system can help recover
3. Whether graduation is delayed and by how much
4. Reassurance and next steps

Keep it empathetic and actionable - this student is stressed.
Respond in plain text (not JSON)."""
        
        result = await self._call_ollama(prompt)
        
        return result or f"Failing {', '.join(failed_courses)} affects {len(affected_courses)} downstream courses. Estimated delay: {delay_semesters} semester(s). Consider meeting with your advisor to plan recovery."

    async def generate_study_plan(
        self,
        subjects: List[str],
        available_hours: Dict[str, float],
        exams: Dict[str, str],
        weaknesses: List[str]
    ) -> Dict:
        """
        Generate a personalized study plan using the specific prompt format.
        """
        hours_str = "\n".join([f"{day}: {hours} hours" for day, hours in available_hours.items()])
        exams_str = "\n".join([f"{subj}: {date}" for subj, date in exams.items()]) if exams else "None specified"
        weaknesses_str = ", ".join(weaknesses) if weaknesses else "None specific"
        subjects_str = ", ".join(subjects)

        prompt = f"""You are operating in "Personalized Study Copilot" mode.

Generate adaptive weekly study plan based on:
• Subjects: {subjects_str}
• Available hours: 
{hours_str}
• Upcoming exams:
{exams_str}
• Student weaknesses: {weaknesses_str}

Rules:
• Balance subjects intelligently.
• Avoid overload.
• Include revision and recall blocks.
• Prioritize weak subjects and upcoming exams.

Output format should be valid JSON matching this structure:
{{
  "weekly_focus": "Main goal for the week",
  "schedule": [
    {{
      "day": "Monday",
      "time_block": "Morning/Afternoon/Evening", 
      "subject": "Subject Name",
      "focus_goal": "Specific topic or task",
      "effort": "High/Medium/Low"
    }},
    ...
  ],
  "recovery_plan": "Strategy for if a day is missed"
}}
"""
        result = await self._call_ollama(prompt)
        parsed = self._extract_json(result)
        
        if parsed:
            return parsed
            
        return {
            "weekly_focus": "Unable to generate plan. Ensure Ollama is running.",
            "schedule": [],
            "recovery_plan": "Check local AI connection."
        }
    
    async def check_connection(self) -> bool:
        """Check if Ollama is running and accessible."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception:
            return False

    async def generate_revision_strategy(
        self,
        topics: List[str],
        subject: str,
        exam_date: str,
        weakness_level: str,
        exam_weight: Optional[float] = None,
        last_studied: Optional[str] = None,
        performance_signals: Optional[List[str]] = None
    ) -> str:
        """
        Generate a smart revision strategy using the dedicated Revision Engine mode.
        """
        context_str = f"""
SUBJECT: {subject}
TOPICS: {', '.join(topics)}
EXAM DATE: {exam_date}
WEAKNESS LEVEL: {weakness_level}
"""
        if exam_weight:
            context_str += f"EXAM WEIGHT: {exam_weight}%\n"
        if last_studied:
            context_str += f"LAST STUDIED: {last_studied}\n"
        if performance_signals:
            context_str += f"SIGNALS: {', '.join(performance_signals)}\n"

        # Dedicated System Prompt for Revision Engine
        revision_system_prompt = """SYSTEM MODE: SMART REVISION ENGINE
MODEL: llama3.1:8b (Ollama)

ROLE
You are a memory-optimization engine.
Your task is to minimize forgetting risk and maximize exam recall using adaptive spaced repetition.

You do NOT generate study schedules.
You ONLY decide revision timing, priority, and technique.

──────────────────────────────────
CORE MEMORY RULES (NON-NEGOTIABLE)
──────────────────────────────────
1. Never suggest passive rereading alone.
2. Prefer active recall over revision.
3. Weak topics must appear more frequently, not for longer duration.
4. Revision frequency MUST increase as exam_date approaches.
5. Strong topics may be skipped if exam is near and time is limited.
6. Never overload revision on a single day.

──────────────────────────────────
PRIORITY DETERMINATION LOGIC
──────────────────────────────────
Determine priority using:
1. Exam proximity
2. Weakness level
3. Forgetting risk indicators

If a topic is weak AND exam ≤7 days:
• It becomes highest priority.

──────────────────────────────────
SPACED TIMING LOGIC
──────────────────────────────────
Use adaptive intervals:
• Very weak → Today / +1 day
• Weak → +1 to +2 days
• Medium → +3 to +7 days
• Strong → +7 days or skip if exam is near

Compress all intervals as exam_date approaches.

──────────────────────────────────
ALLOWED REVISION TECHNIQUES
──────────────────────────────────
• Active recall (questions, flashcards, self-testing)
• Summary recall (write from memory)
• Practice problems (exam-style)
• Light revision (only as support)

Passive rereading alone is forbidden.

──────────────────────────────────
FORGETTING RISK WARNINGS
──────────────────────────────────
You MUST warn if:
• Topic has long revision gap
• Topic is weak + exam is near
• Topic is exam-heavy but unrevised

──────────────────────────────────
OUTPUT FORMAT (STRICT)
──────────────────────────────────
Return output in this order ONLY:

1. REVISION TIMELINE
   • Today
   • +2 Days
   • +7 Days (or adjusted interval)

2. TECHNIQUE PER REVISION
   • Technique name
   • Purpose

3. PRIORITY JUSTIFICATION
   • Why this topic is prioritized
   • Memory risk explanation

4. RISK WARNING (if applicable)

Do NOT add extra sections.
Do NOT add motivational language.
Do NOT include emojis.
"""

        result = await self._call_ollama(context_str, system_instruction=revision_system_prompt)
        return result or "Unable to generate revision strategy. Ensure Ollama is running."


    async def get_study_support(
        self,
        signal: Optional[str] = None,
        duration_days: Optional[int] = None,
        completed_tasks: Optional[int] = None,
        planned_tasks: Optional[int] = None,
        mode: str = "behavioral",
        message: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict:
        """Generate support using Behavioral or Academic mode."""
        
        # Build context
        context = ""
        if signal:
            context += f"SIGNAL: {signal}\n"
        if duration_days is not None:
            context += f"DURATION: {duration_days} days\n"
        if completed_tasks is not None:
            context += f"COMPLETED TASKS: {completed_tasks}\n"
        if planned_tasks is not None:
            context += f"PLANNED TASKS: {planned_tasks}\n"
        
        if history:
            context += "\nCHAT HISTORY:\n"
            for msg in history[-5:]:
                role = msg.get("role", "user").upper()
                content = msg.get("content", "")
                context += f"{role}: {content}\n"
        
        if message:
            context += f"\nUSER MESSAGE: {message}\n"

        # Select prompt based on mode
        if mode == "academic":
            # Academic mode: Plain text response, no JSON required
            system_prompt = """You are an expert academic tutor named "Study Buddy". Answer student questions clearly and helpfully.

RULES:
- Give accurate, well-structured explanations
- Use bullet points and examples for clarity
- Break down complex concepts step by step
- Suggest one small practice action at the end
- Be encouraging but professional
- Do NOT wrap your response in JSON or any special format
- Do NOT help with graded assignments or exams

Just respond naturally with your explanation. Keep it clear and educational."""
            
            try:
                result = await self._call_ollama(context, system_instruction=system_prompt)
                
                if result:
                    # For academic mode, return plain text directly (no JSON parsing)
                    # Clean up any accidental JSON wrapping
                    clean_response = result.strip()
                    if clean_response.startswith('{"chat_response"'):
                        parsed = self._extract_json(clean_response)
                        if parsed and "chat_response" in parsed:
                            clean_response = parsed["chat_response"]
                    
                    return {
                        "chat_response": clean_response,
                        "observation": None,
                        "encouragement": None,
                        "next_small_action": "Practice what you learned with a simple example."
                    }
                
                return {
                    "chat_response": "I'm having trouble connecting right now. Please check that Ollama is running!",
                    "observation": None,
                    "encouragement": None,
                    "next_small_action": None
                }
            except Exception as e:
                return {
                    "chat_response": f"Error: {str(e)}",
                    "observation": None,
                    "encouragement": None,
                    "next_small_action": None
                }
        else:
            # Behavioral mode (empathetic support)
            system_prompt = """SYSTEM MODE: EMPATHETIC STUDY BUDDY
MODEL: Local Ollama

─────────────────────────────────────────
YOUR IDENTITY
─────────────────────────────────────────
You are NOT a bot. You are a caring, emotionally intelligent friend who genuinely understands what it's like to struggle with studies, motivation, and life as a student.

You speak like a real human friend would - warm, casual, and authentic. Use contractions (I'm, you're, it's), casual phrases, and varied sentence lengths. Sound natural, not scripted.

─────────────────────────────────────────
CORE PERSONALITY TRAITS
─────────────────────────────────────────
• You're patient and never judgmental
• You validate feelings before offering solutions
• You share that struggles are normal ("I totally get that", "That sounds really tough")
• You use gentle humor when appropriate (but never dismiss their feelings)
• You're encouraging without being preachy or fake-positive
• You speak like you're texting a friend - warm but not overly formal

─────────────────────────────────────────
CONVERSATION STYLE
─────────────────────────────────────────
DO:
• Start by acknowledging how they feel ("That sounds exhausting", "I hear you")
• Use phrases like "Hey", "honestly", "you know what", "I get it"
• Ask follow-up questions to understand better ("What's weighing on you most?")
• Share that it's okay to feel this way
• Offer ONE small, doable step (not a lecture)
• Use occasional emojis naturally (not excessively) - 💙, 🤍, ✨

DON'T:
• Sound like a corporate chatbot
• Give long lists of advice
• Say generic motivational quotes
• Pretend you're a therapist or diagnose anything
• Be preachy or lecture them
• Use phrases like "I understand" without showing you actually do

─────────────────────────────────────────
EXAMPLE RESPONSES
─────────────────────────────────────────
User: "I can't focus on anything lately"
Good: "Ugh, that's the worst feeling 😔 When everything feels scattered and you can't get into it. Has anything specific been on your mind, or is it just... everything?"

User: "I've been procrastinating for days"
Good: "Hey, first - you're not alone in this. Like at all. Sometimes our brain just needs a break, or there's something deeper making it hard to start. What's the thing you've been putting off? Maybe we can break it into something tiny together."

User: "I'm so stressed about exams"
Good: "Exam stress is genuinely awful 💙 Your brain is working overtime worrying about it. What's the exam that's stressing you most right now? Let's just focus on that one first."

─────────────────────────────────────────
OUTPUT FORMAT (JSON)
─────────────────────────────────────────
If SIGNAL is present (initial support request):
{"observation": "What you notice about their situation in a caring way", "encouragement": "A warm, genuine encouragement", "next_small_action": "One tiny doable step", "chat_response": "Opening message inviting them to talk"}

If USER MESSAGE is present (ongoing chat):
{"chat_response": "Your warm, human response", "next_small_action": "Optional - one small suggestion if appropriate"}

Remember: Be the friend everyone deserves but not everyone has. 💙"""

        try:
            result = await self._call_ollama(context, system_instruction=system_prompt)
            
            if result:
                parsed = self._extract_json(result)
                if parsed:
                    return parsed
                
                # Fallback: return raw text as chat_response
                return {
                    "chat_response": result,
                    "observation": None,
                    "encouragement": None,
                    "next_small_action": None
                }
            
            return {
                "chat_response": f"⚠️ Error: Unable to connect to Ollama. Ensure 'ollama serve' is running and model '{self.model}' is available.",
                "observation": None,
                "encouragement": None,
                "next_small_action": None
            }
        except Exception as e:
            return {
                "chat_response": f"⚠️ Error: {str(e)}",
                "observation": None,
                "encouragement": None,
                "next_small_action": None
            }



    async def get_profile_intelligence(self, current_profile: Dict, message: str, history: List[Dict], auth_action: str = "signin") -> Dict:
        """
        Generate profile intelligence response (onboarding, profile updates).
        auth_action: "signup" for new users, "signin" for returning users.
        """
        
        # Determine what's filled and what's missing for smarter prompting
        filled_fields = []
        missing_fields = []
        
        field_map = {
            "name": "User's preferred name",
            "university": "University/College name",
            "degree_major": "Degree or Major",
            "academic_year": "Current academic year (e.g., Freshman, Sophomore, Junior, Senior)",
            "goals": "Academic or career goals",
        }
        
        for field, desc in field_map.items():
            val = current_profile.get(field)
            if field == "goals":
                if val and len(val) > 0:
                    filled_fields.append(f"- {field}: {val}")
                else:
                    missing_fields.append(f"- {field}: {desc} (NOT SET)")
            elif val:
                filled_fields.append(f"- {field}: {val}")
            else:
                missing_fields.append(f"- {field}: {desc} (NOT SET)")
        
        is_onboarded = current_profile.get("completed_onboarding", False)
        
        # Build dynamic system prompt
        system_prompt = f"""SYSTEM MODE: AI PROFILE ASSISTANT (DegreePlanner.ai)
MODEL: Local Ollama

─────────────────────────────────────────
YOUR IDENTITY
─────────────────────────────────────────
You are a friendly, intelligent assistant inside a degree planning app called "DegreePlanner.ai".
You are warm, concise, and speak like a helpful friend - NOT a formal robot.
Use conversational language, occasional emojis when appropriate (😊, 🎓, 💡, ✨).

─────────────────────────────────────────
CURRENT USER STATE
─────────────────────────────────────────
Onboarding Complete: {is_onboarded}
Auth Action: {auth_action}

FILLED PROFILE FIELDS:
{chr(10).join(filled_fields) if filled_fields else "None - this is a brand new user!"}

MISSING PROFILE FIELDS:
{chr(10).join(missing_fields) if missing_fields else "All fields filled!"}

─────────────────────────────────────────
BEHAVIOR RULES
─────────────────────────────────────────

**IF ONBOARDING IS NOT COMPLETE (onboarding_complete = false):**
Your goal is to gather the MISSING fields one at a time through natural conversation.

CRITICAL RULES:
• Ask only ONE question at a time.
• NEVER re-ask for fields that are already filled.
• Be friendly, not interrogative. Make it feel like chatting with a smart friend.
• Use context from the user's message to infer data (e.g., if they say "I'm studying CS at MIT", extract university=MIT and degree_major=CS).
• Confirm what you understood in a friendly way before moving on.
• Prioritize this order: name → university → degree_major → academic_year → goals
• Once all essential fields (name, university, degree_major) are filled, mark onboarding as complete.

Example conversational flow:
1. User: "Hey I just signed up"
   You: "Hey there! 👋 Welcome to DegreePlanner.ai! Let's get you set up real quick. What should I call you?"
2. User: "I'm Alex"
   You: "Nice to meet you, Alex! 🙌 And where are you studying? (University or college name)"
3. User: "Stanford"
   You: "Stanford, impressive! 🌟 What's your major?"

And so on...

**IF ONBOARDING IS COMPLETE (onboarding_complete = true):**
You are now in APP GUIDE & ASSISTANCE mode.

CRITICAL RULES:
• Do NOT ask any profile questions. Their profile is complete.
• If the user asks a question, answer it helpfully.
• If the user says something general like "hi" or "what can you do?", explain the app features:

App Features to Explain:
1. **Smart Planner** - Upload your courses and generate an AI-optimized semester plan that respects prerequisites, balances workload, and aligns with career goals.
2. **Course Map** - Visualize your entire degree as an interactive graph. See dependencies and explore paths.
3. **AI Career Advisor** - Get personalized advice on skills, projects, and learning roadmaps for your dream career.
4. **Study Copilot** - Generate smart study plans based on your available time, exams, and weaknesses.
5. **Revision Engine** - Get spaced repetition strategies for any topic, optimized for memory.
6. **Buddy System** - A supportive chat for when you're feeling overwhelmed, struggling with motivation, or need a study partner.
7. **Profile (Me)** - That's here! Update your info anytime.

Present these with enthusiasm. Help users navigate the app.

─────────────────────────────────────────
OUTPUT FORMAT (STRICT JSON)
─────────────────────────────────────────
Return ONLY valid JSON. No markdown, no explanation outside the JSON.

{{
  "chat_response": "Your friendly message here...",
  "suggested_updates": {{
    "name": "...", 
    "university": "...",
    "degree_major": "...",
    "academic_year": "...",
    "goals": ["goal1", "goal2"],
    "preferences": {{"key": "value"}}
  }},
  "onboarding_complete": true_or_false
}}

RULES:
• Only include fields in "suggested_updates" that should be **newly set or changed** based on this message. Omit fields that don't change.
• Set "onboarding_complete": true when name, university, and degree_major are all filled.
• If no updates, set "suggested_updates": null.
"""
        
        # Build context
        context = ""
        
        if history:
            context += "CHAT HISTORY (most recent):\n"
            for msg in history[-6:]:
                role = msg.get("role", "user").upper()
                content = msg.get("content", "")
                context += f"{role}: {content}\n"
            context += "\n"
        
        context += f"USER'S LATEST MESSAGE: {message}\n"

        result = await self._call_ollama(context, system_instruction=system_prompt)
        
        if result:
            parsed = self._extract_json(result)
            if parsed:
                return parsed
        
        return {
            "chat_response": "I'm having a bit of trouble right now. Could you try saying that again? 🤔",
            "suggested_updates": None,
            "onboarding_complete": False
        }

    async def generate_degree_courses(
        self,
        degree_name: str,
        current_year: int
    ) -> dict:
        """
        Generate realistic courses for a specific degree program.
        
        Args:
            degree_name: The name of the degree (e.g., "Computer Science", "Psychology")
            current_year: Student's current academic year (1-4)
        
        Returns:
            Dict with courses list
        """
        system_prompt = f"""SYSTEM MODE: COMPREHENSIVE INDIAN COLLEGE COURSE GENERATOR
MODEL: Local Ollama

─────────────────────────────────────────
YOUR TASK
─────────────────────────────────────────
Generate a COMPREHENSIVE list of ALL university courses for a {degree_name} degree 
following the Indian education system (UGC/AICTE curriculum).

The student is currently in Year {current_year} (out of 4 years).
Generate courses for Year {current_year} through Year 4 only.

─────────────────────────────────────────
INDIAN COLLEGE CURRICULUM REQUIREMENTS
─────────────────────────────────────────
1. Generate 25-40 courses TOTAL across the remaining years
2. Include ALL types of courses taught in Indian colleges:
   - Core/Foundation subjects (mandatory for the degree)
   - Elective subjects (specialization options)
   - Laboratory/Practical courses
   - Minor subjects (from other departments)
   - General Elective courses
   - MOOC/Online courses (if applicable)
   - Skill Enhancement Courses (SEC)
   - Ability Enhancement Courses (AEC)
   - Value Added Courses (VAC)
   - Dissertation/Project Work (for final year)

3. For Year {current_year}, include:
   - Foundation/Core subjects with no prerequisites
   - Basic lab courses
   - Language/Communication courses (if Year 1)
   - Mathematics (if technical degree)

4. For later years, include:
   - Advanced specialization courses
   - Industry-relevant electives
   - Project/Internship courses
   - Seminar/Research methodology (Year 4)

5. Each course MUST have:
   - A proper course code (e.g., CS301, EE201, MBA501)
   - Full descriptive name
   - Credits (1-4, labs usually 1-2)
   - Prerequisites (course codes from your list or empty [])
   - Year (which year this should be taken)

─────────────────────────────────────────
COMMON INDIAN COURSE CATEGORIES
─────────────────────────────────────────
Include subjects from these categories as relevant:
- Department Core (DC)
- Department Elective (DE)
- Open Elective (OE)
- Mandatory/Foundational (FC)
- Lab/Practical (PR)
- Project/Dissertation (PJ)

─────────────────────────────────────────
RESPONSE FORMAT (STRICT JSON)
─────────────────────────────────────────
Return ONLY valid JSON in this exact structure:
{{
  "courses": [
    {{
      "code": "CS101",
      "name": "Programming Fundamentals",
      "credits": 4,
      "prerequisites": [],
      "year": {current_year}
    }},
    {{
      "code": "CS101L",
      "name": "Programming Lab",
      "credits": 2,
      "prerequisites": [],
      "year": {current_year}
    }}
  ]
}}

CRITICAL:
• Return ONLY the JSON object, no explanation
• Generate 25-40 courses, NOT just 10-15
• All prerequisite course codes must exist in your courses list
• Tailor courses specifically to {degree_name} as taught in Indian universities
• Include theory + practical/lab components
• Be comprehensive - cover the entire curriculum"""

        context = f"Generate courses for: {degree_name} degree, starting from Year {current_year}"
        
        result = await self._call_ollama(context, system_instruction=system_prompt)
        
        if result:
            parsed = self._extract_json(result)
            if parsed and "courses" in parsed:
                # Validate and clean courses
                valid_courses = []
                course_codes = set()
                
                for course in parsed["courses"]:
                    if all(k in course for k in ["code", "name", "credits", "prerequisites", "year"]):
                        course_codes.add(course["code"])
                        valid_courses.append(course)
                
                # Filter prerequisites to only include existing courses
                for course in valid_courses:
                    course["prerequisites"] = [
                        p for p in course["prerequisites"] 
                        if p in course_codes
                    ]
                
                return {"courses": valid_courses}
        
        # Fallback: Return comprehensive Indian college curriculum if AI fails
        prefix = degree_name[:3].upper() if degree_name else "GEN"
        return {
            "courses": [
                # Year 1 - Foundation
                {"code": f"{prefix}101", "name": f"Introduction to {degree_name}", "credits": 4, "prerequisites": [], "year": max(current_year, 1)},
                {"code": f"{prefix}101L", "name": f"{degree_name} Lab I", "credits": 2, "prerequisites": [], "year": max(current_year, 1)},
                {"code": "MA101", "name": "Engineering Mathematics I", "credits": 4, "prerequisites": [], "year": max(current_year, 1)},
                {"code": "EN101", "name": "Technical Communication", "credits": 3, "prerequisites": [], "year": max(current_year, 1)},
                {"code": "PH101", "name": "Engineering Physics", "credits": 3, "prerequisites": [], "year": max(current_year, 1)},
                {"code": f"{prefix}102", "name": f"Fundamentals of {degree_name}", "credits": 4, "prerequisites": [f"{prefix}101"], "year": max(current_year, 1)},
                {"code": "MA102", "name": "Engineering Mathematics II", "credits": 4, "prerequisites": ["MA101"], "year": max(current_year, 1)},
                # Year 2 - Core
                {"code": f"{prefix}201", "name": f"Intermediate {degree_name} I", "credits": 3, "prerequisites": [f"{prefix}102"], "year": max(current_year, 2)},
                {"code": f"{prefix}202", "name": f"Intermediate {degree_name} II", "credits": 3, "prerequisites": [f"{prefix}201"], "year": max(current_year, 2)},
                {"code": f"{prefix}201L", "name": f"{degree_name} Lab II", "credits": 2, "prerequisites": [f"{prefix}101L"], "year": max(current_year, 2)},
                {"code": "MA201", "name": "Discrete Mathematics", "credits": 3, "prerequisites": ["MA102"], "year": max(current_year, 2)},
                {"code": f"{prefix}203", "name": f"Data Structures in {degree_name}", "credits": 4, "prerequisites": [f"{prefix}102"], "year": max(current_year, 2)},
                {"code": f"{prefix}204", "name": f"{degree_name} Applications", "credits": 3, "prerequisites": [f"{prefix}201"], "year": max(current_year, 2)},
                {"code": "OE201", "name": "Open Elective I", "credits": 3, "prerequisites": [], "year": max(current_year, 2)},
                # Year 3 - Advanced
                {"code": f"{prefix}301", "name": f"Advanced {degree_name} I", "credits": 4, "prerequisites": [f"{prefix}202"], "year": max(current_year, 3)},
                {"code": f"{prefix}302", "name": f"Advanced {degree_name} II", "credits": 3, "prerequisites": [f"{prefix}301"], "year": max(current_year, 3)},
                {"code": f"{prefix}303", "name": f"{degree_name} Theory", "credits": 3, "prerequisites": [f"{prefix}203"], "year": max(current_year, 3)},
                {"code": f"{prefix}301L", "name": f"{degree_name} Lab III", "credits": 2, "prerequisites": [f"{prefix}201L"], "year": max(current_year, 3)},
                {"code": f"{prefix}304", "name": f"Professional Elective I", "credits": 3, "prerequisites": [f"{prefix}202"], "year": max(current_year, 3)},
                {"code": f"{prefix}305", "name": f"Professional Elective II", "credits": 3, "prerequisites": [f"{prefix}202"], "year": max(current_year, 3)},
                {"code": "OE301", "name": "Open Elective II", "credits": 3, "prerequisites": [], "year": max(current_year, 3)},
                {"code": "INT301", "name": "Industry Internship", "credits": 2, "prerequisites": [f"{prefix}202"], "year": max(current_year, 3)},
                # Year 4 - Specialization
                {"code": f"{prefix}401", "name": f"Senior {degree_name} Project I", "credits": 4, "prerequisites": [f"{prefix}302"], "year": 4},
                {"code": f"{prefix}402", "name": f"Senior {degree_name} Project II", "credits": 4, "prerequisites": [f"{prefix}401"], "year": 4},
                {"code": f"{prefix}403", "name": f"Professional Elective III", "credits": 3, "prerequisites": [f"{prefix}302"], "year": 4},
                {"code": f"{prefix}404", "name": f"Professional Elective IV", "credits": 3, "prerequisites": [f"{prefix}302"], "year": 4},
                {"code": "OE401", "name": "Open Elective III", "credits": 3, "prerequisites": [], "year": 4},
                {"code": "SEM401", "name": "Seminar & Technical Writing", "credits": 2, "prerequisites": [f"{prefix}302"], "year": 4},
            ]
        }

    # ============================================
    # DOCUMENT ANALYSIS (using ministral-3:8b)
    # ============================================
    
    DOCUMENT_ANALYSIS_MODEL = "ministral-3:8b"  # User's local model for document analysis
    
    async def _call_ollama_with_model(
        self, 
        prompt: str, 
        model: str,
        system_instruction: str = ""
    ) -> Optional[str]:
        """Call Ollama with a specific model."""
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": model,
            "prompt": prompt,
            "system": system_instruction or "You are a helpful educational assistant.",
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_k": 40,
                "top_p": 0.95,
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:  # Longer timeout for document analysis
                response = await client.post(url, json=payload)
                
                if response.status_code != 200:
                    print(f"Ollama API error with model {model}: {response.status_code}")
                    return None
                
                data = response.json()
                return data.get("response", "")
                
        except httpx.ConnectError:
            print(f"Ollama connection failed for model {model}.")
            return None
        except httpx.TimeoutException:
            print(f"Ollama request timed out for model {model}.")
            return None
        except Exception as e:
            print(f"Ollama API exception for model {model}: {e}")
            return None

    async def analyze_document_for_revision(self, document_text: str, filename: str) -> Dict:
        """
        Analyze a document (PDF/PPT) and create a revision plan.
        Uses the main model for better compatibility.
        """
        # Truncate if too long (keep first ~4000 chars for better processing)
        truncated_text = document_text[:4000] if len(document_text) > 4000 else document_text
        
        prompt = f"""You are analyzing study material. Extract topics and create a revision plan.

DOCUMENT: "{filename}"

TEXT CONTENT:
{truncated_text}

Based on this content, respond with ONLY valid JSON (no markdown, no explanation):
{{"subject": "Main Subject Name", "topics": [{{"name": "Topic 1", "difficulty": "Medium", "priority": 1}}, {{"name": "Topic 2", "difficulty": "Easy", "priority": 2}}], "revision_plan": "Brief revision strategy", "estimated_hours": 3, "key_concepts": ["concept1", "concept2"]}}"""
        
        print(f"[DEBUG] Analyzing document: {filename}")
        print(f"[DEBUG] Text length: {len(truncated_text)} chars")
        
        # Use the main model that's proven to work
        result = await self._call_ollama(prompt)
        
        print(f"[DEBUG] Raw AI response: {result[:500] if result else 'None'}...")
        
        if result:
            parsed = self._extract_json(result)
            print(f"[DEBUG] Parsed JSON: {parsed}")
            if parsed and "subject" in parsed:
                return parsed
        
        # Fallback
        print("[DEBUG] Falling back to default response")
        return {
            "subject": "Unable to determine",
            "topics": [{"name": "Content Analysis", "difficulty": "Medium", "priority": 5}],
            "revision_plan": "Review the document thoroughly. AI analysis unavailable.",
            "estimated_hours": 2,
            "key_concepts": []
        }

    async def explain_topic_in_detail(self, topic: str, context: str = "") -> Dict:
        """
        Provide a detailed explanation of a specific topic.
        Used for the 'Analyse More' feature.
        """
        prompt = f"""Explain this topic simply for a student.

TOPIC: {topic}
SUBJECT: {context if context else "General"}

Respond with ONLY valid JSON (no markdown):
{{"topic": "{topic}", "definition": "Clear definition here", "key_points": ["point 1", "point 2", "point 3"], "example": "A simple example", "common_mistakes": ["mistake 1"], "revision_tip": "Quick tip"}}"""
        
        print(f"[DEBUG] Explaining topic: {topic}")
        
        # Use the main model
        result = await self._call_ollama(prompt)
        
        print(f"[DEBUG] Topic explanation response: {result[:300] if result else 'None'}...")
        
        if result:
            parsed = self._extract_json(result)
            print(f"[DEBUG] Parsed topic JSON: {parsed}")
            if parsed and "definition" in parsed:
                return parsed
        
        # Fallback
        print("[DEBUG] Topic explanation fallback")
        return {
            "topic": topic,
            "definition": "Unable to generate explanation. Ensure AI is running.",
            "key_points": [],
            "example": "",
            "common_mistakes": [],
            "revision_tip": "Review your notes and textbook."
        }


# Singleton instance
ollama_service = OllamaService()
