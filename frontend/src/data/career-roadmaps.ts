import type { AIAdviceResponse } from "@/lib/api";

export const cachedCareerRoadmaps: Record<string, AIAdviceResponse> = {
    "machine learning engineer": {
        top_courses: [
            { code: "CS460", reason: "Foundational Machine Learning concepts and algorithms" },
            { code: "CS480", reason: "Deep Learning and Neural Networks architecture" },
            { code: "MATH310", reason: "Linear Algebra essential for ML math" },
            { code: "CS350", reason: "Data Systems for managing large datasets" }
        ],
        learning_path: [
            "Intro to Python & Statistics",
            "Linear Algebra & Calculus",
            "Data Analysis with Pandas/NumPy",
            "Machine Learning Algorithms (Scikit-Learn)",
            "Deep Learning (TensorFlow/PyTorch)",
            "NLP & Computer Vision",
            "MLOps & Deployment"
        ],
        career_tips: [
            "Build a strong portfolio on GitHub with end-to-end projects",
            "Participate in Kaggle competitions to practice on real datasets",
            "Read research papers to stay updated with latest architectures",
            "Focus on both model building and model deployment (MLOps)"
        ],
        certifications: [
            {
                name: "TensorFlow Developer Certificate",
                issuer: "Google",
                difficulty: "Intermediate",
                cost: "$100",
                value: "High - Industry recognized standard"
            },
            {
                name: "AWS Certified Machine Learning - Specialty",
                issuer: "AWS",
                difficulty: "Advanced",
                cost: "$300",
                value: "Very High - Essential for cloud ML"
            },
            {
                name: "Deep Learning Specialization",
                issuer: "Coursera (DeepLearning.AI)",
                difficulty: "Intermediate",
                cost: "$49/mo",
                value: "High - Theoretical foundation"
            }
        ],
        project_ideas: [
            {
                title: "End-to-End Image Classifier",
                description: "Build a CNN to classify images (e.g., plant diseases) and deploy it as a web app.",
                difficulty: "Intermediate",
                tech_stack: ["Python", "TensorFlow", "Flask", "Docker"],
                learning_outcomes: ["CNN Architecture", "Model Serving", "API Integration"],
                time_estimate: "3 weeks"
            },
            {
                title: "Real-time Sentiment Analysis Pipeline",
                description: "Process live tweets to analyze sentiment about a brand using Kafka and Transformers.",
                difficulty: "Advanced",
                tech_stack: ["Python", "Hugging Face", "Apache Kafka", "Elasticsearch"],
                learning_outcomes: ["NLP", "Stream Processing", "Big Data"],
                time_estimate: "5 weeks"
            },
            {
                title: "House Price Prediction Service",
                description: "Regression model to predict prices based on housing features with an interactive UI.",
                difficulty: "Beginner",
                tech_stack: ["Python", "Scikit-Learn", "Streamlit", "Pandas"],
                learning_outcomes: ["Data Cleaning", "Feature Engineering", "Regression"],
                time_estimate: "1 week"
            }
        ],
        salary_progression: [
            { stage: "Entry Level", range_usd: "$90k - $130k", range_inr: "₹8L - ₹18L", years_experience: "0-2 years" },
            { stage: "Mid Level", range_usd: "$130k - $180k", range_inr: "₹18L - ₹35L", years_experience: "2-5 years" },
            { stage: "Senior", range_usd: "$180k - $250k+", range_inr: "₹35L - ₹60L+", years_experience: "5+ years" },
            { stage: "Lead / Staff", range_usd: "$250k - $400k+", range_inr: "₹60L - ₹1Cr+", years_experience: "8+ years" }
        ],
        interview_prep: [
            {
                question: "Explain the Bias-Variance Tradeoff.",
                answer_key: "Bias is error from erroneous assumptions (underfitting). Variance is error from sensitivity to small fluctuations (overfitting). The tradeoff is finding the sweet spot where total error is minimized.",
                difficulty: "Intermediate"
            },
            {
                question: "What is the difference between Bagging and Boosting?",
                answer_key: "Bagging (Bootstrap Aggregating) trains models in parallel (e.g., Random Forest) to reduce variance. Boosting trains models sequentially (e.g., XGBoost) where each model corrects previous errors to reduce bias.",
                difficulty: "Advanced"
            },
            {
                question: "How do you handle imbalanced datasets?",
                answer_key: "Techniques include: 1) Resampling (Oversampling minority/Undersampling majority), 2) Using SMOTE, 3) Changing metrics (F1-score instead of Accuracy), 4) Using penalized models (class weights).",
                difficulty: "Intermediate"
            }
        ],
        missing_skills: [
            {
                skill: "MLOps",
                description: "Deploying and maintaining models in production.",
                recommended_resource: "Coursera MLOps Specialization"
            },
            {
                skill: "Cloud Computing",
                description: "Running ML workloads on AWS/GCP/Azure.",
                recommended_resource: "AWS Cloud Practitioner Essentials"
            }
        ],
        study_schedule: [
            { week: "Week 1", focus: "Python & Math Foundation", activities: ["Refresh Linear Algebra", "Master NumPy/Pandas", "Statistics basics"] },
            { week: "Week 2", focus: "Supervised Learning", activities: ["Regression models", "Classification algorithms", "Scikit-learn practice"] },
            { week: "Week 3", focus: "Deep Learning basics", activities: ["Neural Networks theory", "Build simple MLP", "Intro to TensorFlow"] },
            { week: "Week 4", focus: "Project & Deployment", activities: ["Build end-to-end small project", "Deploy with Flask", "Document on GitHub"] }
        ],
        industry_trends: [
            { trend: "Large Language Models (LLMs)", description: "Shift towards fine-tuning and RAG architectures.", skills_needed: ["Transformers", "LangChain", "Vector DBs"] },
            { trend: "Edge AI", description: "Running models on devices with low latency.", skills_needed: ["TFLite", "Model Quantization", "On-device training"] },
            { trend: "AutoML", description: "Automating model selection and hyperparameter tuning.", skills_needed: ["AutoSklearn", "H2O.ai", "Neural Architecture Search"] }
        ],
        companies_to_target: [
            { company: "NVIDIA", type: "Hardware/AI", hiring_level: "High", typical_role: "Deep Learning Engineer" },
            { company: "Google DeepMind", type: "Research", hiring_level: "High", typical_role: "Research Scientist" },
            { company: "Databricks", type: "Data Platform", hiring_level: "Medium", typical_role: "ML Engineer" },
            { company: "Hugging Face", type: "Open Source AI", hiring_level: "Medium", typical_role: "Machine Learning Engineer" }
        ],
        book_recommendations: [
            { title: "Hands-On Machine Learning", author: "Aurélien Géron", why_read: "Best practical guide for Scikit-Learn and TensorFlow.", level: "All Levels" },
            { title: "Deep Learning", author: "Ian Goodfellow", why_read: "The 'Bible' of Deep Learning theory.", level: "Advanced" },
            { title: "Designing Machine Learning Systems", author: "Chip Huyen", why_read: "Focuses on MLOps and production challenges.", level: "Intermediate" }
        ],
        online_communities: [
            { name: "Kaggle", platform: "Web", link_hint: "kaggle.com", benefit: "Datasets, competitions, and kernels" },
            { name: "r/MachineLearning", platform: "Reddit", link_hint: "reddit.com", benefit: "Research discussions and news" },
            { name: "Hugging Face Discord", platform: "Discord", link_hint: "discord.gg/huggingface", benefit: "Open source community and help" }
        ],
        day_in_life: "Start with standup meeting. Spend morning cleaning new dataset and feature engineering. Afternoon involves training a new XGBoost model and tuning hyperparameters. Late afternoon calls with backend team to discuss API schema for model deployment. End day reading a new ArXiv paper.",
        career_progression: [
            { level: "Junior MLE", years: "0-2", responsibilities: "Data cleaning, training simple models, writing tests", skills_focus: "Python, SQL, Scikit-Learn" },
            { level: "Senior MLE", years: "3-5", responsibilities: "System design, MLOps pipelines, mentoring juniors", skills_focus: "System Design, Kubernetes, Advanced DL" },
            { level: "Staff/Principal MLE", years: "6+", responsibilities: "Architecture decisions, cross-team strategy, research", skills_focus: "Leadership, Novel Architectures, Strategy" }
        ]
    },
    "full stack developer": {
        top_courses: [
            { code: "CS300", reason: "Web Development fundamental concepts" },
            { code: "CS420", reason: "Database Management Systems essential for backend" },
            { code: "CS330", reason: "User Interface Design" },
            { code: "CS450", reason: "Distributed Systems for scalable apps" }
        ],
        learning_path: [
            "HTML/CSS & JavaScript Deep Dive",
            "Frontend Framework (React/Next.js)",
            "Backend API Development (Node/Express or Python/FastAPI)",
            "Relational & NoSQL Databases",
            "Authentication & Security",
            "Docker & CI/CD",
            "System Design & Architecture"
        ],
        career_tips: [
            "Don't just code tutorials; build complete products from scratch",
            "Learn to read other people's code by contributing to open source",
            "Understand the 'why' behind frameworks, not just syntax",
            "Focus on web performance and accessibility"
        ],
        certifications: [
            {
                name: "AWS Certified Developer - Associate",
                issuer: "AWS",
                difficulty: "Intermediate",
                cost: "$150",
                value: "Very High - Cloud skills are mandatory"
            },
            {
                name: "Meta Front-End Developer PC",
                issuer: "Coursera",
                difficulty: "Beginner",
                cost: "$49/mo",
                value: "Medium - Good starting point"
            },
            {
                name: "MongoDB Developer Associate",
                issuer: "MongoDB",
                difficulty: "Intermediate",
                cost: "$150",
                value: "Medium - Good for MEAN/MERN stack"
            }
        ],
        project_ideas: [
            {
                title: "Trello Clone (Kanban Board)",
                description: "Drag-and-drop task management app with real-time updates.",
                difficulty: "Advanced",
                tech_stack: ["React", "DnD Kit", "Node.js", "Socket.io", "MongoDB"],
                learning_outcomes: ["WebSockets", "Complex State Management", "Drag and Drop"],
                time_estimate: "4 weeks"
            },
            {
                title: "E-commerce Dashboard",
                description: "Admin panel for an online store with charts and data tables.",
                difficulty: "Intermediate",
                tech_stack: ["Next.js", "Tailwind CSS", "Recharts", "PostgreSQL"],
                learning_outcomes: ["Data Visualization", "Admin Layouts", "SQL Queries"],
                time_estimate: "2 weeks"
            },
            {
                title: "Personal Blog with CMS",
                description: "Static site blog with a custom Content Management System.",
                difficulty: "Beginner",
                tech_stack: ["Next.js", "Markdown", "Firebase Auth"],
                learning_outcomes: ["SSG/SSR", "Authentication", "CMS Structures"],
                time_estimate: "1 week"
            }
        ],
        salary_progression: [
            { stage: "Junior Dev", range_usd: "$70k - $100k", range_inr: "₹5L - ₹12L", years_experience: "0-2 years" },
            { stage: "Mid-Level Dev", range_usd: "$100k - $140k", range_inr: "₹12L - ₹25L", years_experience: "2-5 years" },
            { stage: "Senior Dev", range_usd: "$140k - $190k", range_inr: "₹25L - ₹45L", years_experience: "5+ years" },
            { stage: "Staff/Principal", range_usd: "$190k - $300k+", range_inr: "₹45L - ₹80L+", years_experience: "8+ years" }
        ],
        interview_prep: [
            {
                question: "Explain the Virtual DOM in React.",
                answer_key: "The Virtual DOM is a lightweight copy of the real DOM. When state changes, React updates the virtual DOM, compares it with the previous version (diffing), and only updates the necessary nodes in the real DOM (reconciliation) for better performance.",
                difficulty: "Intermediate"
            },
            {
                question: "What is the difference between SQL and NoSQL?",
                answer_key: "SQL databases are relational, table-based, and have strict schemas (e.g., PostgreSQL). NoSQL databases are non-relational, document/key-value based, and have flexible schemas (e.g., MongoDB). SQL is better for complex queries; NoSQL for scalability and unstructured data.",
                difficulty: "Beginner"
            },
            {
                question: "How do you prevent CORS errors?",
                answer_key: "CORS (Cross-Origin Resource Sharing) is a browser security feature. To fix errors, the server must set appropriate headers (Access-Control-Allow-Origin). Simple fixes include using a proxy during development or configuring CORS middleware in the backend.",
                difficulty: "Intermediate"
            }
        ],
        missing_skills: [
            {
                skill: "Testing",
                description: "Writing Unit, Integration, and E2E tests.",
                recommended_resource: "Testing JavaScript with Kent C. Dodds"
            },
            {
                skill: "Docker",
                description: "Containerizing applications for consistent deployment.",
                recommended_resource: "Docker for Beginners (Udemy)"
            }
        ],
        study_schedule: [
            { week: "Week 1", focus: "Frontend Fundamentals", activities: ["Deep dive CSS Grid/Flexbox", "Advanced JavaScript (Closures, Promises)", "React Hooks"] },
            { week: "Week 2", focus: "Backend Basics", activities: ["REST API design", "Node.js Event Loop", "SQL Database Modeling"] },
            { week: "Week 3", focus: "Connecting Full Stack", activities: ["Fetch data in React", "Handle CORS/Auth", "State Management (Redux/Zustand)"] },
            { week: "Week 4", focus: "Deployment & DevOps", activities: ["Dockerize app", "Set up CI/CD pipeline", "Deploy to Vercel/Render"] }
        ],
        industry_trends: [
            { trend: "Server Side Rendering (SSR)", description: "Moving logic to server for performance and SEO.", skills_needed: ["Next.js", "Remix", "Hydration"] },
            { trend: "Type Safety", description: "Universal adoption of TypeScript across full stack.", skills_needed: ["TypeScript", "Zod", "tRPC"] },
            { trend: "AI Coding Assistants", description: "Using AI to write boilerplate and tests.", skills_needed: ["Copilot", "Prompt Engineering"] }
        ],
        companies_to_target: [
            { company: "Vercel", type: "DevTools", hiring_level: "High", typical_role: "Software Engineer" },
            { company: "Stripe", type: "FinTech", hiring_level: "High", typical_role: "Full Stack Engineer" },
            { company: "Shopify", type: "E-commerce", hiring_level: "Medium", typical_role: "Developer" },
            { company: "Netflix", type: "Streaming", hiring_level: "High", typical_role: "UI Engineer" }
        ],
        book_recommendations: [
            { title: "Clean Code", author: "Robert C. Martin", why_read: "Essential for writing maintainable software.", level: "All Levels" },
            { title: "You Don't Know JS", author: "Kyle Simpson", why_read: "Deep understanding of JavaScript mechanics.", level: "Advanced" },
            { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", why_read: "Master class in backend system design.", level: "Advanced" }
        ],
        online_communities: [
            { name: "Dev.to", platform: "Web", link_hint: "dev.to", benefit: "Written tutorials and career advice" },
            { name: "Hashnode", platform: "Web", link_hint: "hashnode.com", benefit: "Blogging platform for devs" },
            { name: "Stack Overflow", platform: "Web", link_hint: "stackoverflow.com", benefit: "Q&A for specific bugs" }
        ],
        day_in_life: "Check Jira for assigned tickets. Morning standup. Spend morning implementing a new UI component in React. Code review teammate's PR before lunch. Afternoon spent debugging a slow API endpoint in Node.js. Wrap up by pushing code and checking CI build status.",
        career_progression: [
            { level: "Junior Developer", years: "0-2", responsibilities: "Bug fixes, minor features, learning codebase", skills_focus: "Html/CSS/JS, Git" },
            { level: "Senior Developer", years: "3-5", responsibilities: "Feature ownership, architecture planning, mentoring", skills_focus: "System Design, Performance, Security" },
            { level: "Tech Lead", years: "6+", responsibilities: "Team technical strategy, cross-team coordination", skills_focus: "Leadership, Communication, Architecture" }
        ]
    },
    "data scientist": {
        top_courses: [
            { code: "CS400", reason: "Foundational Data Science and Analysis" },
            { code: "MATH410", reason: "Advanced Statistics and Probability" },
            { code: "CS460", reason: "Machine Learning Concepts" },
            { code: "CS420", reason: "Database Systems and SQL" }
        ],
        learning_path: [
            "Python/R Programming",
            "Statistics & Probability",
            "Data Collection & Cleaning (SQL/Pandas)",
            "Exploratory Data Analysis (Visualization)",
            "Machine Learning Algorithms",
            "Big Data Technologies (Spark/Hadoop)",
            "Deep Learning Basics"
        ],
        career_tips: [
            "Domain knowledge is as important as technical skills",
            "Learn to tell stories with data, not just show numbers",
            "Kaggle is great, but messy real-world data is better practice",
            "Understanding business metrics (KPIs) is critical"
        ],
        certifications: [
            { name: "Certified Analytics Professional (CAP)", issuer: "INFORMS", difficulty: "Advanced", cost: "$695", value: "High - For seasoned professionals" },
            { name: "Azure Data Scientist Associate", issuer: "Microsoft", difficulty: "Intermediate", cost: "$165", value: "High - Cloud specific" },
            { name: "IBM Data Science Professional Certificate", issuer: "Coursera", difficulty: "Beginner", cost: "$39/mo", value: "Medium - Good comprehensive entry" }
        ],
        project_ideas: [
            {
                title: "Customer Churn Prediction",
                description: "Identify users likely to cancel subscription using logistic regression.",
                difficulty: "Intermediate",
                tech_stack: ["Python", "Pandas", "Scikit-Learn", "Matplotlib"],
                learning_outcomes: ["Classification", "Feature Importance", "Business ROI"],
                time_estimate: "2 weeks"
            },
            {
                title: "Stock Market Dashboard",
                description: "Visualize trends and use Time Series ARIMA models for forecasting.",
                difficulty: "Advanced",
                tech_stack: ["Plotly Dash", "Statsmodels", "Yahoo Finance API"],
                learning_outcomes: ["Time Series", "Interactive Viz", "Data Pipelines"],
                time_estimate: "4 weeks"
            },
            {
                title: "A/B Testing Simulator",
                description: "Simulate and analyze web traffic experiments.",
                difficulty: "Intermediate",
                tech_stack: ["Python", "SciPy", "Streamlit"],
                learning_outcomes: ["Hypothesis Testing", "Statistical Significance", "Experiment Design"],
                time_estimate: "1 week"
            }
        ],
        salary_progression: [
            { stage: "Jr. Data Scientist", range_usd: "$95k - $120k", range_inr: "₹8L - ₹15L", years_experience: "0-2 years" },
            { stage: "Data Scientist", range_usd: "$120k - $160k", range_inr: "₹15L - ₹30L", years_experience: "2-5 years" },
            { stage: "Sr. Data Scientist", range_usd: "$160k - $210k", range_inr: "₹30L - ₹55L", years_experience: "5+ years" },
            { stage: "Principal DS", range_usd: "$210k - $350k+", range_inr: "₹55L - ₹90L+", years_experience: "8+ years" }
        ],
        interview_prep: [
            {
                question: "Explain P-value to a non-technical stakeholder.",
                answer_key: "The P-value tells us if a result is statistically significant or just random noise. A P-value < 0.05 is like saying 'there is less than a 5% chance this result happened by luck', so we can trust it.",
                difficulty: "Intermediate"
            },
            {
                question: "What is overfitting and how do you prevent it?",
                answer_key: "Overfitting is when a model memorizes training data but fails on new data. Prevention: 1) Simplify the model, 2) Use more training data, 3) Cross-validation, 4) Regularization (L1/L2), 5) Pruning (for Trees).",
                difficulty: "Beginner"
            },
            {
                question: "JOINs vs UNIONs in SQL?",
                answer_key: "JOIN combines columns from two tables based on a related key. UNION combines rows from two result sets (appending them vertically).",
                difficulty: "Beginner"
            }
        ],
        missing_skills: [
            { skill: "Data Engineering", description: "Building reliable pipelines to get data.", recommended_resource: "Data Engineering Zoomcamp" },
            { skill: "Business Acumen", description: "Translating data to dollars.", recommended_resource: "Measuring What Matters (Book)" }
        ],
        industry_trends: [
            { trend: "Data-Centric AI", description: "Improving data quality rather than model architecture.", skills_needed: ["Data Cleaning", "Labeling Ops"] },
            { trend: "Synthetic Data", description: "Generating artifical data for privacy training.", skills_needed: ["GANs", "Differential Privacy"] },
            { trend: "Decision Intelligence", description: "Merging data science with decision theory.", skills_needed: ["Causal Inference", "Optimization"] }
        ],
        companies_to_target: [
            { company: "Airbnb", type: "Tech/Hospitality", hiring_level: "High", typical_role: "Data Scientist - Inference" },
            { company: "Uber", type: "Logistics", hiring_level: "High", typical_role: "Applied Scientist" },
            { company: "Capital One", type: "Finance", hiring_level: "Medium", typical_role: "Data Analyst" },
            { company: "Spotify", type: "Media", hiring_level: "Medium", typical_role: "Product Data Scientist" }
        ],
        book_recommendations: [
            { title: "Storytelling with Data", author: "Cole Knaflic", why_read: "Learn to visualize data effectively.", level: "Beginner" },
            { title: "Naked Statistics", author: "Charles Wheelan", why_read: "Intuitive understanding of stats concepts.", level: "Beginner" },
            { title: "Pattern Recognition and Machine Learning", author: "Christopher Bishop", why_read: "Deep theoretical dive.", level: "Advanced" }
        ],
        online_communities: [
            { name: "Kaggle", platform: "Web", link_hint: "kaggle.com", benefit: "Competitions and Kernels" },
            { name: "Towards Data Science", platform: "Medium", link_hint: "towardsdatascience.com", benefit: "Articles and Tutorials" },
            { name: "Data Science Stack Exchange", platform: "Web", link_hint: "datascience.stackexchange.com", benefit: "Q&A" }
        ],
        day_in_life: "Start day reviewing automated dashboard alerts. Meeting with Product Manager to define metrics for new feature launch. Query SQL database to extract dataset. Spend afternoon exploring data in Jupyter Notebook and visualizing distributions. Present findings on user behavior change to stakeholders.",
        career_progression: [
            { level: "Data Analyst", years: "0-2", responsibilities: "Reporting, SQL queries, dashboarding", skills_focus: "SQL, Tableau, Excel" },
            { level: "Data Scientist", years: "2-5", responsibilities: "Modeling, prediction, advanced analysis", skills_focus: "Python, Stats, ML" },
            { level: "Lead Data Scientist", years: "5+", responsibilities: "Project roadmap, advanced research, mentoring", skills_focus: "Strategy, Communication, Leadership" }
        ]
    },
    "devops engineer": {
        top_courses: [
            { code: "CS450", reason: "Operating Systems and Linux internals" },
            { code: "CS470", reason: "Computer Networks and Security" },
            { code: "CS410", reason: "Software Engineering principles" },
            { code: "CS480", reason: "Cloud Computing Architectures" }
        ],
        learning_path: [
            "Linux Fundamentals & Shell Scripting",
            "Networking (DNS, HTTP, TCP/IP)",
            "Cloud Providers (AWS/Azure)",
            "Infrastructure as Code (Terraform)",
            "Containerization (Docker)",
            "Orchestration (Kubernetes)",
            "CI/CD Pipelines (Jenkins/GitHub Actions)"
        ],
        career_tips: [
            "Automate everything you do more than twice",
            "Security is not an afterthought (DevSecOps)",
            "Learn to debug systems you didn't build",
            "Understand the developer workflow to serve them better"
        ],
        certifications: [
            { name: "Certified Kubernetes Administrator (CKA)", issuer: "Cloud Native Computing Foundation", difficulty: "Advanced", cost: "$395", value: "Gold Standard" },
            { name: "HashiCorp Certified: Terraform Associate", issuer: "HashiCorp", difficulty: "Intermediate", cost: "$70", value: "High - IaC standard" },
            { name: "AWS Certified Solutions Architect", issuer: "AWS", difficulty: "Intermediate", cost: "$150", value: "Very High" }
        ],
        project_ideas: [
            {
                title: "Automated Cloud Deployment",
                description: "Use Terraform to provision AWS VPC, EC2, and RDS, then deploy app via Ansible.",
                difficulty: "Intermediate",
                tech_stack: ["Terraform", "Ansible", "AWS"],
                learning_outcomes: ["IaC", "Configuration Management", "Cloud Networking"],
                time_estimate: "2 weeks"
            },
            {
                title: "Kubernetes Cluster on Bare Metal",
                description: "Set up a K8s cluster from scratch on VMs without managed services.",
                difficulty: "Advanced",
                tech_stack: ["Linux", "Kubernetes", "Etcd", "Networking"],
                learning_outcomes: ["K8s Component Deep Dive", "System Admin"],
                time_estimate: "4 weeks"
            },
            {
                title: "CI/CD Pipeline for Microservices",
                description: "Pipeline that runs tests, builds docker images, and deploys to staging.",
                difficulty: "Intermediate",
                tech_stack: ["GitHub Actions", "Docker", "Heroku/Render"],
                learning_outcomes: ["Automation", "Build Tools", "Release Strategy"],
                time_estimate: "1 week"
            }
        ],
        salary_progression: [
            { stage: "Jr. DevOps", range_usd: "$80k - $110k", range_inr: "₹6L - ₹15L", years_experience: "0-2 years" },
            { stage: "DevOps Engineer", range_usd: "$110k - $150k", range_inr: "₹15L - ₹35L", years_experience: "2-5 years" },
            { stage: "Sr. DevOps", range_usd: "$150k - $200k", range_inr: "₹35L - ₹60L", years_experience: "5+ years" },
            { stage: "SRE / Cloud Architect", range_usd: "$200k - $300k+", range_inr: "₹60L - ₹1Cr+", years_experience: "8+ years" }
        ],
        interview_prep: [
            {
                question: "What happens when you type google.com in browser?",
                answer_key: "DNS lookup -> TCP handshake -> TLS handshake -> HTTP Request -> Server Processing -> HTTP Response -> Browser Rendering. DevOps focus: DNS, Load Balancers, CDN, Caching.",
                difficulty: "Intermediate"
            },
            {
                question: "Explain the concept of Immutable Infrastructure.",
                answer_key: "Servers are never modified after deployment. If an update is needed, you build a new image and replace the old server. Reduces configuration drift and ensures consistency.",
                difficulty: "Advanced"
            },
            {
                question: "Hard link vs Soft link in Linux?",
                answer_key: "Soft link (Symlink) is a pointer to a filename (like a shortcut). Hard link is a direct pointer to the inode (data on disk). Deleting source breaks symlink but not hard link.",
                difficulty: "Beginner"
            }
        ],
        missing_skills: [
            { skill: "Monitoring/Observability", description: "Prometheus, Grafana, ELK Stack.", recommended_resource: "Grafana Tutorials" },
            { skill: "Scripting (Go/Python)", description: "Beyond Bash, for custom tooling.", recommended_resource: "Learn Go with Tests" }
        ],
        industry_trends: [
            { trend: "Platform Engineering", description: "Building internal developer platforms (IDP).", skills_needed: ["Backstage", "Product Thinking"] },
            { trend: "GitOps", description: "Git as single source of truth for infrastructure.", skills_needed: ["ArgoCD", "Flux"] },
            { trend: "Serverless", description: "No ops management.", skills_needed: ["Lambda", "Cloud Run"] }
        ],
        companies_to_target: [
            { company: "GitLab", type: "DevTools", hiring_level: "High", typical_role: "SRE" },
            { company: "HashiCorp", type: "Infrastructure", hiring_level: "High", typical_role: "Solutions Engineer" },
            { company: "DigitalOcean", type: "Cloud", hiring_level: "Medium", typical_role: "Cloud Operations" },
            { company: "Datadog", type: "Monitoring", hiring_level: "High", typical_role: "Software Engineer - SRE" }
        ],
        book_recommendations: [
            { title: "The Phoenix Project", author: "Gene Kim", why_read: "Novel about DevOps culture and philosophy.", level: "Beginner" },
            { title: "Site Reliability Engineering", author: "Google Team", why_read: "How Google runs production systems.", level: "Advanced" },
            { title: "Kubernetes Up & Running", author: "Kelsey Hightower", why_read: "Best K8s guide.", level: "Intermediate" }
        ],
        online_communities: [
            { name: "r/DevOps", platform: "Reddit", link_hint: "reddit.com", benefit: "Discussions and rants" },
            { name: "CNCF Slack", platform: "Slack", link_hint: "slack.cncf.io", benefit: "Direct access to project maintainers" },
            { name: "DevOps Chat", platform: "Telegram", link_hint: "t.me/devopssupport", benefit: "Quick help" }
        ],
        day_in_life: "Review Prometheus alerts for anomalies. Standup with dev team to discuss upcoming deployments. Write Terraform module for new Redis cluster. After lunch, troubleshoot a failed CI build for the frontend team. End day by patching OS security updates on staging environment.",
        career_progression: [
            { level: "SysAdmin", years: "0-2", responsibilities: "Server maintenance, scripting, user management", skills_focus: "Linux, Bash" },
            { level: "DevOps Engineer", years: "2-5", responsibilities: "CI/CD, Cloud provisioning, Containers", skills_focus: "Docker, AWS, Jenkins" },
            { level: "Site Reliability Engineer (SRE)", years: "5+", responsibilities: "Availability, Latency, Performance, Incident Response", skills_focus: "Go, Architecture, SLOs" }
        ]
    },
    "cybersecurity analyst": {
        top_courses: [
            { code: "CS470", reason: "Network Security Fundamentals" },
            { code: "CS465", reason: "Cryptography Principles" },
            { code: "CS450", reason: "Operating System Security" },
            { code: "CS390", reason: "Ethical Hacking and Pen Testing" }
        ],
        learning_path: [
            "Networking Basics (OSI Model, TCP/IP)",
            "Linux/Windows System Administration",
            "Network Security (Firewalls, IDS/IPS)",
            "Vulnerability Assessment Tools",
            "Incident Response & Forensics",
            "Web App Security (OWASP Top 10)",
            "Cryptography & PKI"
        ],
        career_tips: [
            "Participate in CTF (Capture The Flag) competitions",
            "Keep up with CVEs and zero-day vulnerabilities daily",
            "Ethics are paramount; never test without permission",
            "Document everything; reporting is 50% of the job"
        ],
        certifications: [
            { name: "CompTIA Security+", issuer: "CompTIA", difficulty: "Beginner", cost: "$392", value: "High - Industry entry standard" },
            { name: "Certified Ethical Hacker (CEH)", issuer: "EC-Council", difficulty: "Intermediate", cost: "$1199", value: "Medium - HR filter" },
            { name: "OSCP (Offensive Security Certified Professional)", issuer: "OffSec", difficulty: "Very Hard", cost: "$1499", value: "Legendary - Proof of practical skill" }
        ],
        project_ideas: [
            {
                title: "Home Lab Setup",
                description: "Build a virtualized environment with a Kali attacker and vulnerable target VMs.",
                difficulty: "Intermediate",
                tech_stack: ["VirtualBox", "Kali Linux", "Metasploitable", "Pfsense"],
                learning_outcomes: ["Virtualization", "Network Segregation", "Attack Vectors"],
                time_estimate: "2 weeks"
            },
            {
                title: "Keylogger & Detection Tool",
                description: "Write a simple keylogger in Python and a separate tool to detect its signature.",
                difficulty: "Intermediate",
                tech_stack: ["Python", "Win32 API", "YARA Rules"],
                learning_outcomes: ["Malware Behavior", "Endpoint Detection"],
                time_estimate: "1 week"
            },
            {
                title: "Packet Sniffer Analysis",
                description: "Capture network traffic and analyze for cleartext credentials.",
                difficulty: "Beginner",
                tech_stack: ["Wireshark", "Tcpdump"],
                learning_outcomes: ["Packet Analysis", "Protocol Insecurity"],
                time_estimate: "1 week"
            }
        ],
        salary_progression: [
            { stage: "SOC Analyst L1", range_usd: "$70k - $95k", range_inr: "₹6L - ₹12L", years_experience: "0-2 years" },
            { stage: "Security Analyst", range_usd: "$95k - $130k", range_inr: "₹12L - ₹25L", years_experience: "2-5 years" },
            { stage: "Security Engineer", range_usd: "$130k - $180k", range_inr: "₹25L - ₹45L", years_experience: "5+ years" },
            { stage: "CISO / Security Architect", range_usd: "$180k - $300k+", range_inr: "₹45L - ₹1Cr+", years_experience: "8+ years" }
        ],
        interview_prep: [
            {
                question: "Explain the CIA Triad.",
                answer_key: "Confidentiality (only authorized access), Integrity (data is not tampered with), Availability (system is accessible). All security controls map to one of these.",
                difficulty: "Beginner"
            },
            {
                question: "How do you defend against Cross-Site Scripting (XSS)?",
                answer_key: "1) Input Validation, 2) Output Encoding/Sanitization (converting special chars to HTML entities), 3) Content Security Policy (CSP) headers.",
                difficulty: "Intermediate"
            },
            {
                question: "What is a Syn Flood attack?",
                answer_key: "A type of DoS attack where attacker sends many TCP SYN packets but never completes the handshake (ACK), filling up the server's connection table and blocking legitimate users.",
                difficulty: "Intermediate"
            }
        ],
        missing_skills: [
            { skill: "Compliance", description: "GDPR, HIPAA, SOC2 frameworks.", recommended_resource: "Compliance documentation" },
            { skill: "Reverse Engineering", description: "Decompiling malware code.", recommended_resource: "Ghidra tutorials" }
        ],
        industry_trends: [
            { trend: "Zero Trust Architecture", description: "Trust no one, verify everything.", skills_needed: ["Identity Management", "Micro-segmentation"] },
            { trend: "Cloud Security", description: "Securing AWS/Azure environments.", skills_needed: ["IAM", "CloudTrail"] },
            { trend: "AI in Cybersecurity", description: "AI-driven threat detection.", skills_needed: ["Anomaly Detection", "SOAR"] }
        ],
        companies_to_target: [
            { company: "CrowdStrike", type: "Endpoint Security", hiring_level: "High", typical_role: "Threat Hunter" },
            { company: "Palo Alto Networks", type: "Network Security", hiring_level: "High", typical_role: "Security Engineer" },
            { company: "FireEye", type: "Forensics", hiring_level: "Medium", typical_role: "Malware Analyst" },
            { company: "NSA/Government", type: "Defense", hiring_level: "High", typical_role: "Cryptanalyst" }
        ],
        book_recommendations: [
            { title: "Blue Team Handbook", author: "Don Murdoch", why_read: "Practical guide for SOC analysts.", level: "Intermediate" },
            { title: "Hacking: The Art of Exploitation", author: "Jon Erickson", why_read: "Deep dive into C programming and exploits.", level: "Advanced" },
            { title: "Social Engineering", author: "Christopher Hadnagy", why_read: "Human side of security.", level: "Beginner" }
        ],
        online_communities: [
            { name: "HackTheBox", platform: "Web", link_hint: "hackthebox.com", benefit: "Practical hacking labs" },
            { name: "r/netsec", platform: "Reddit", link_hint: "reddit.com", benefit: "Technical security news" },
            { name: "OWASP", platform: "Web", link_hint: "owasp.org", benefit: "Standards and Local chapters" }
        ],
        day_in_life: "Start shift checking SIEM for high-severity alerts. Investigate a suspicious login attempt from an unknown IP. Re-image an infected laptop. Afternoon meeting on firewall rule changes. Run a vulnerability scan on the new web portal. Write a report on findings.",
        career_progression: [
            { level: "SOC Analyst", years: "0-2", responsibilities: "Monitoring alerts, triage, basic response", skills_focus: "SIEM, Logs" },
            { level: "Penetration Tester", years: "2-5", responsibilities: "Active exploitation, reporting vulnerabilities", skills_focus: "Kali, Metasploit" },
            { level: "Security Architect", years: "5+", responsibilities: "Designing secure systems, policy making", skills_focus: "Architecture, Risk Mgmt" }
        ]
    },
    "cloud architect": {
        top_courses: [
            { code: "CS480", reason: "Advanced Cloud Architectures" },
            { code: "CS450", reason: "Distributed Systems Design" },
            { code: "CS470", reason: "Network Engineering" },
            { code: "CS420", reason: "Database Scalability" }
        ],
        learning_path: [
            "AWS/Azure/GCP Fundamentals",
            "Networking Deep Dive (VPC, Subnets, DNS)",
            "Compute Services (EC2, Lambda, Kubernetes)",
            "Storage & Databases (S3, RDS, DynamoDB)",
            "Security & Compliance (IAM, KMS)",
            "Architecture Patterns (Microservices, Serverless)",
            "Cost Optimization & Migration"
        ],
        career_tips: [
            "Pick one cloud provider to master first (usually AWS) then branch out",
            "Draw diagrams for everything; architecture is visual",
            "Understand 'The Well-Architected Framework' inside out",
            "Learn to calculate TCO (Total Cost of Ownership) to convince stakeholders"
        ],
        certifications: [
            { name: "AWS Certified Solutions Architect - Professional", issuer: "AWS", difficulty: "Advanced", cost: "$300", value: "Gold Standard" },
            { name: "Azure Solutions Architect Expert", issuer: "Microsoft", difficulty: "Advanced", cost: "$165", value: "High" },
            { name: "Google Professional Cloud Architect", issuer: "Google", difficulty: "Advanced", cost: "$200", value: "High" }
        ],
        project_ideas: [
            {
                title: "Serverless Image Processing Pipeline",
                description: "Upload image to S3 -> Trigger Lambda to resize -> Store in DynamoDB.",
                difficulty: "Intermediate",
                tech_stack: ["AWS Lambda", "S3", "DynamoDB", "Python"],
                learning_outcomes: ["Serverless", "Event-driven Architecture"],
                time_estimate: "1 week"
            },
            {
                title: "Multi-Region High Availability App",
                description: "Deploy app across 2 regions with failover using Route53.",
                difficulty: "Advanced",
                tech_stack: ["AWS Route53", "EC2", "Load Balancers"],
                learning_outcomes: ["Disaster Recovery", "Global Traffic Management"],
                time_estimate: "3 weeks"
            },
            {
                title: "Cost Optimizer Bot",
                description: "Script that analyzes usage and recommends cost-saving actions.",
                difficulty: "Intermediate",
                tech_stack: ["Python (Boto3)", "CloudWatch"],
                learning_outcomes: ["Cloud APIs", "FinOps"],
                time_estimate: "2 weeks"
            }
        ],
        salary_progression: [
            { stage: "Cloud Engineer", range_usd: "$100k - $140k", range_inr: "₹10L - ₹25L", years_experience: "0-3 years" },
            { stage: "Cloud Architect", range_usd: "$140k - $200k", range_inr: "₹25L - ₹50L", years_experience: "3-7 years" },
            { stage: "Principal Architect", range_usd: "$200k - $350k+", range_inr: "₹50L - ₹1Cr+", years_experience: "7+ years" },
            { stage: "CTO / Head of Infrastructure", range_usd: "$300k+", range_inr: "₹1Cr+", years_experience: "10+ years" }
        ],
        interview_prep: [
            {
                question: "Explain CAP Theorem.",
                answer_key: "In a distributed system, you can only pick 2 out of 3: Consistency (everyone sees same data), Availability (system always responds), Partition Tolerance (system works despite network failure). P is mandatory, so choice is usually CP vs AP.",
                difficulty: "Intermediate"
            },
            {
                question: "How would you design a system like Netflix?",
                answer_key: "Focus on Content Delivery Network (CDN) for video streaming, Microservices for backend, Recommendation Engine, and high availability database choices (Cassandra).",
                difficulty: "Advanced"
            },
            {
                question: "Vertical vs Horizontal Scaling?",
                answer_key: "Vertical: Add more power (CPU/RAM) to existing server (easy but limited). Horizontal: Add more servers (infinite scale but complex management).",
                difficulty: "Beginner"
            }
        ],
        missing_skills: [
            { skill: "Leadership", description: "Influence without authority.", recommended_resource: "The Manager's Path" },
            { skill: "Containerization", description: "Deep docker/K8s knowledge.", recommended_resource: "Kubernetes The Hard Way" }
        ],
        industry_trends: [
            { trend: "Hybrid Cloud", description: "Mixing on-premise with public cloud.", skills_needed: ["AWS Outposts", "Azure Arc"] },
            { trend: "FinOps", description: "Financial operations for cloud cost management.", skills_needed: ["Cost Explorer", "Budgeting"] },
            { trend: "Green Cloud", description: "Optimizing for sustainability and carbon footprint.", skills_needed: ["Carbon Analytics"] }
        ],
        companies_to_target: [
            { company: "AWS", type: "Cloud Provider", hiring_level: "High", typical_role: "Solutions Architect" },
            { company: "Capital One", type: "Bank (Cloud First)", hiring_level: "Medium", typical_role: "Cloud Engineer" },
            { company: "Datadog", type: "Monitoring", hiring_level: "High", typical_role: "Infrastructure Engineer" },
            { company: "Salesforce", type: "SaaS", hiring_level: "High", typical_role: "Architect" }
        ],
        book_recommendations: [
            { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", why_read: "Architecture bible.", level: "Advanced" },
            { title: "Building Microservices", author: "Sam Newman", why_read: "Microservices patterns.", level: "Intermediate" },
            { title: "System Design Interview", author: "Alex Xu", why_read: "Ace the interview.", level: "Intermediate" }
        ],
        online_communities: [
            { name: "r/aws", platform: "Reddit", link_hint: "reddit.com", benefit: "Cloud news" },
            { name: "Cloud Native Computing Foundation", platform: "Web", link_hint: "cncf.io", benefit: "K8s and Cloud Native tech" },
            { name: "InfoQ", platform: "Web", link_hint: "infoq.com", benefit: "Architecture articles" }
        ],
        day_in_life: "Review architecture diagrams for a new payment service. Consult with dev team on database choice (DynamoDB vs RDS). Present cloud migration strategy to VP of Engineering. Debug a production latency issue involving load balancer configuration.",
        career_progression: [
            { level: "Cloud Engineer", years: "0-3", responsibilities: "Provisioning resources, monitoring", skills_focus: "Terraform, AWS Console" },
            { level: "Solutions Architect", years: "3-7", responsibilities: "Designing systems, client consultation", skills_focus: "Design Patterns, Security" },
            { level: "Principal Architect", years: "7+", responsibilities: "Enterprise strategy, standards definition", skills_focus: "Strategy, Leadership" }
        ]
    },
    "product manager": {
        top_courses: [
            { code: "BUS300", reason: "Product Strategy & Management" },
            { code: "CS300", reason: "Foundations of Technical Systems (for Tech PM)" },
            { code: "BUS420", reason: "Marketing & User Behavior" },
            { code: "BUS350", reason: "Data Analytics for Business" }
        ],
        learning_path: [
            "Agile & Scrum Methodologies",
            "User Research & Persona Building",
            "Product Roadmapping & Prioritization",
            "Wireframing & Prototyping (Figma)",
            "Data Analytics (SQL/Amplitude)",
            "A/B Testing & Experimentation",
            "Go-to-Market Strategy"
        ],
        career_tips: [
            "Learn to say 'No' to 90% of requests to focus on the 10% that matter",
            "Fall in love with the problem, not the solution",
            "Build technical empathy to work better with engineers",
            "Communication is your primary tool; master it"
        ],
        certifications: [
            { name: "Product School PMC", issuer: "Product School", difficulty: "Intermediate", cost: "$4000", value: "High - Networking" },
            { name: "Google Project Management", issuer: "Coursera", difficulty: "Beginner", cost: "$39/mo", value: "Medium - Good basics" },
            { name: "Certified Scrum Product Owner (CSPO)", issuer: "Scrum Alliance", difficulty: "Beginner", cost: "$1000", value: "Medium - Agile focus" }
        ],
        project_ideas: [
            {
                title: "Launch a Niche Newsletter",
                description: "Define target audience, create content strategy, grow subscribers.",
                difficulty: "Beginner",
                tech_stack: ["Substack", "ConvertKit", "Growth Hacking"],
                learning_outcomes: ["User Acquisition", "Content Strategy"],
                time_estimate: "4 weeks"
            },
            {
                title: "Product Case Study",
                description: "Deep dive analysis of a popular app (e.g., Spotify) improving a specific feature.",
                difficulty: "Intermediate",
                tech_stack: ["Figma", "Slides", "User Research"],
                learning_outcomes: ["Product Thinking", "UX Design"],
                time_estimate: "2 weeks"
            },
            {
                title: "No-Code MVP",
                description: "Build a functioning marketplace or tool using Bubble/Glide.",
                difficulty: "Intermediate",
                tech_stack: ["Bubble", "Airtable", "Zapier"],
                learning_outcomes: ["MVP Scope", "Launch"],
                time_estimate: "3 weeks"
            }
        ],
        salary_progression: [
            { stage: "Assoc. PM (APM)", range_usd: "$90k - $120k", range_inr: "₹10L - ₹20L", years_experience: "0-2 years" },
            { stage: "Product Manager", range_usd: "$120k - $170k", range_inr: "₹20L - ₹40L", years_experience: "2-5 years" },
            { stage: "Sr. PM", range_usd: "$170k - $240k", range_inr: "₹40L - ₹70L", years_experience: "5+ years" },
            { stage: "VP of Product", range_usd: "$250k - $400k+", range_inr: "₹70L - ₹1Cr+", years_experience: "8+ years" }
        ],
        interview_prep: [
            {
                question: "Design a alarm clock for the deaf.",
                answer_key: "Framework: 1) Clarify Goal, 2) User Segments, 3) Pain Points, 4) Solutions (Vibration pillow, strobe lights, wearable), 5) Prioritize & Success Metrics.",
                difficulty: "Intermediate"
            },
            {
                question: "How would you prioritize features?",
                answer_key: "RICE Score (Reach, Impact, Confidence, Effort) or MoSCoW method. Always tie back to business goals and user impact.",
                difficulty: "Intermediate"
            },
            {
                question: "What is your favorite product and why?",
                answer_key: "Pick a product, explain the user problem it solves, what makes it unique (UX/Moat), and one thing you'd improve. Shows product sense.",
                difficulty: "Beginner"
            }
        ],
        missing_skills: [
            { skill: "SQL", description: "Pulling your own data.", recommended_resource: "SQLBolt" },
            { skill: "UX Design", description: "Wireframing concepts.", recommended_resource: "Refactoring UI" }
        ],
        industry_trends: [
            { trend: "Product-Led Growth (PLG)", description: "Product sells itself (e.g., Slack).", skills_needed: ["Virality", "Onboarding UX"] },
            { trend: "AI PM", description: "Managing AI/ML products.", skills_needed: ["AI Ethics", "Model Lifecycle"] },
            { trend: "Remote Collaboration", description: "Managing distributed teams.", skills_needed: ["Async Comms", "Loom"] }
        ],
        companies_to_target: [
            { company: "Google", type: "Tech", hiring_level: "High (APM)", typical_role: "Product Manager" },
            { company: "Uber", type: "Marketplace", hiring_level: "High", typical_role: "PM" },
            { company: "Atlassian", type: "B2B SaaS", hiring_level: "Medium", typical_role: "Product Manager" },
            { company: "Startup", type: "Any", hiring_level: "Medium", typical_role: "Founding PM" }
        ],
        book_recommendations: [
            { title: "Inspired", author: "Marty Cagan", why_read: "Bible of product management.", level: "Beginner" },
            { title: "The Lean Startup", author: "Eric Ries", why_read: "Build-Measure-Learn loop.", level: "Beginner" },
            { title: "Hooked", author: "Nir Eyal", why_read: "Building habit-forming products.", level: "Intermediate" }
        ],
        online_communities: [
            { name: "Lenny's Newsletter", platform: "Web", link_hint: "lennysnewsletter.com", benefit: "Best PM content" },
            { name: "Product Hunt", platform: "Web", link_hint: "producthunt.com", benefit: "New product trends" },
            { name: "Women in Product", platform: "Web", link_hint: "womenpm.org", benefit: "Networking" }
        ],
        day_in_life: "Review usage metrics from yesterday's launch. Standup with engineering team. 3 user interviews to understand pain points with checkout flow. Write PRD (Product Requirements Doc) for new feature. alignment meeting with Sales/Marketing.",
        career_progression: [
            { level: "APM", years: "0-2", responsibilities: "Execution, writing tickets, small features", skills_focus: "Execution, Data" },
            { level: "Product Manager", years: "2-5", responsibilities: "Feature ownership, roadmap for squad", skills_focus: "Strategy, User Research" },
            { level: "Group PM", years: "5+", responsibilities: "Managing other PMs, product area strategy", skills_focus: "Leadership, Hiring" }
        ]
    },
    "ai research scientist": {
        top_courses: [
            { code: "CS500", reason: "Advanced Algorithms" },
            { code: "CS580", reason: "Deep Learning Theory" },
            { code: "MATH450", reason: "Stochastic Processes" },
            { code: "CS520", reason: "Reinforcement Learning" }
        ],
        learning_path: [
            "Advanced Mathematics (Proof-based)",
            "Information Theory",
            "Deep Learning Architectures (Transformers, Diffusion)",
            "Generative AI & LLMs",
            "Reinforcement Learning",
            "Academic Writing & Publishing",
            "GPU Optimization (CUDA)"
        ],
        career_tips: [
            "Publishing in top conferences (NeurIPS, ICML) is the main currency",
            "A PhD is often required for top research roles",
            "Collaborate with professors early",
            "Read one paper a day"
        ],
        certifications: [
            { name: "PhD in Computer Science/AI", issuer: "University", difficulty: "Very Hard", cost: "$$$", value: "Required for Research" },
            { name: "NVIDIA DLI Certificate", issuer: "NVIDIA", difficulty: "Advanced", cost: "$500", value: "High - GPU skills" }
        ],
        project_ideas: [
            {
                title: "Reproduce a Paper",
                description: "Implement a recent ArXiv paper from scratch in PyTorch.",
                difficulty: "Advanced",
                tech_stack: ["PyTorch", "LaTeX"],
                learning_outcomes: ["Deep Understanding", "Debugging Models"],
                time_estimate: "4 weeks"
            },
            {
                title: "Novel Loss Function",
                description: "Experiment with a new loss function for a standard task.",
                difficulty: "Advanced",
                tech_stack: ["Python", "Math"],
                learning_outcomes: ["Research Methodology", "Benchmarking"],
                time_estimate: "3 weeks"
            },
            {
                title: "Optimize Transformer Inference",
                description: "Implement KV-caching or quantization for Llama model.",
                difficulty: "Advanced",
                tech_stack: ["CUDA", "C++", "Python"],
                learning_outcomes: ["Performance Engineering", "LLM Internals"],
                time_estimate: "3 weeks"
            }
        ],
        salary_progression: [
            { stage: "PhD Student", range_usd: "$30k - $50k", range_inr: "₹4L - ₹8L", years_experience: "0-5 years" },
            { stage: "Research Scientist", range_usd: "$200k - $400k", range_inr: "₹40L - ₹1Cr", years_experience: "0-3 years (post-PhD)" },
            { stage: "Sr. Research Scientist", range_usd: "$400k - $600k", range_inr: "₹1Cr - ₹2Cr", years_experience: "3-7 years" },
            { stage: "Distinguished Scientist", range_usd: "$600k - $1M+", range_inr: "₹2Cr+", years_experience: "7+ years" }
        ],
        interview_prep: [
            {
                question: "Derive Backpropagation equation.",
                answer_key: "Requires calculus chain rule derivation for gradients w.r.t weights and biases.",
                difficulty: "Advanced"
            },
            {
                question: "Explain Attention Mechanism mathematically.",
                answer_key: "Softmax(QK^T / sqrt(d_k))V. Explain scaling factor and why it's needed.",
                difficulty: "Advanced"
            },
            {
                question: "Why does Vanishing Gradient happen?",
                answer_key: "In deep networks with sigmoid/tanh, gradients < 1 multiply during backprop approaching zero. Solution: ReLU, Residual Connections.",
                difficulty: "Intermediate"
            }
        ],
        missing_skills: [
            { skill: "Grant Writing", description: "Getting funding for research.", recommended_resource: "University Workshops" },
            { skill: "Public Speaking", description: "Presenting papers.", recommended_resource: "Toastmasters" }
        ],
        industry_trends: [
            { trend: "Reasoning Models", description: "Models that 'think' (Chain of Thought).", skills_needed: ["Prompting Strategy", "RLHF"] },
            { trend: "Multimodal AI", description: "Text + Image + Audio.", skills_needed: ["Contrastive Learning", "CLIP"] },
            { trend: "AI Alignment", description: "Ensuring AI is safe.", skills_needed: ["Interpretability", "Ethics"] }
        ],
        companies_to_target: [
            { company: "OpenAI", type: "AI Lab", hiring_level: "Very High", typical_role: "Member of Technical Staff" },
            { company: "Anthropic", type: "AI Safety", hiring_level: "Very High", typical_role: "Research Engineer" },
            { company: "Google DeepMind", type: "Research", hiring_level: "Very High", typical_role: "Research Scientist" },
            { company: "Meta FAIR", type: "Research", hiring_level: "High", typical_role: "Research Scientist" }
        ],
        book_recommendations: [
            { title: "Deep Learning", author: "Ian Goodfellow", why_read: "Theory foundation.", level: "Advanced" },
            { title: "Reinforcement Learning", author: "Sutton & Barto", why_read: "RL bible.", level: "Advanced" },
            { title: "The Bitter Lesson", author: "Rich Sutton", why_read: "Essay on compute vs human knowledge.", level: "Advanced" }
        ],
        online_communities: [
            { name: "ArXiv", platform: "Web", link_hint: "arxiv.org", benefit: "Latest papers" },
            { name: "Twitter (AI Twitter)", platform: "Social", link_hint: "twitter.com", benefit: "Fastest news source" },
            { name: "NeurIPS", platform: "Conference", link_hint: "neurips.cc", benefit: "Networking" }
        ],
        day_in_life: "Read new ArXiv papers over coffee. Weekly research group meeting to discuss progress. Debug PyTorch training run on cluster (Loss is exploding). Write section of paper for upcoming conference deadline. Discuss novel idea with colleague at whiteboard.",
        career_progression: [
            { level: "PhD Student", years: "3-5", responsibilities: "Learning, experimenting, publishing first papers", skills_focus: "Math, Coding, Writing" },
            { level: "Research Scientist", years: "0-5 (Post-PhD)", responsibilities: "Leading research agenda, publishing", skills_focus: "Novelty, Impact" },
            { level: "Principal Scientist", years: "5+", responsibilities: "Setting research direction for lab", skills_focus: "Vision, Mentorship" }
        ]
    },
    "blockchain developer": {
        top_courses: [
            { code: "CS465", reason: "Cryptography Fundamentals (Essential)" },
            { code: "CS450", reason: "Distributed Systems" },
            { code: "CS470", reason: "Network Security" },
            { code: "CS320", reason: "Data Structures (Merkle Trees)" }
        ],
        learning_path: [
            "Cryptography Basics (Hashing, PKI, Digital Signatures)",
            "Blockchain Fundamentals (Consensus, Blocks, Mining)",
            "Smart Contact Development (Solidity/Rust)",
            "Web3 Integration (Ethers.js, Web3.js)",
            "DeFi Protocols & Tokenomics",
            "L2 Solutions & Scalability",
            "Security & Auditing (Reentrancy, Gas Optimization)"
        ],
        career_tips: [
            "Security is everything; one bug can lose millions",
            "Read whitepapers of top protocols (Bitcoin, Ethereum, Uniswap)",
            "Participate in Hackathons (ETHGlobal)",
            "Anonymity is common, but reputation is key"
        ],
        certifications: [
            { name: "Certified Blockchian Developer", issuer: "Blockchain Council", difficulty: "Beginner", cost: "$229", value: "Medium - Good theory" },
            { name: "ConsenSys Academy Developer", issuer: "ConsenSys", difficulty: "Advanced", cost: "$985", value: "High - Industry Standard" },
            { name: "Chainlink Developer Expert", issuer: "Chainlink", difficulty: "Intermediate", cost: "Free", value: "High - For Oracle usage" }
        ],
        project_ideas: [
            {
                title: "Decentralized Exchange (DEX)",
                description: "Build a simple swap interface with a liquidity pool smart contract.",
                difficulty: "Advanced",
                tech_stack: ["Solidity", "Hardhat", "React", "Ethers.js"],
                learning_outcomes: ["AMM Logic", "Token Standards (ERC-20)", "Frontend Integration"],
                time_estimate: "3 weeks"
            },
            {
                title: "NFT Marketplace",
                description: "Create a platform to mint, list, and buy NFTs.",
                difficulty: "Intermediate",
                tech_stack: ["Solidity", "IPFS", "Next.js"],
                learning_outcomes: ["ERC-721/1155", "Metadata Storage", "Auction Mechanisms"],
                time_estimate: "2 weeks"
            },
            {
                title: "Voting DAO",
                description: "Governance contract where token holders can vote on proposals.",
                difficulty: "Beginner",
                tech_stack: ["Solidity", "Remix"],
                learning_outcomes: ["Voting Logic", "State Management", "Access Control"],
                time_estimate: "1 week"
            }
        ],
        salary_progression: [
            { stage: "Jr. Blockchain Dev", range_usd: "$90k - $120k", range_inr: "₹10L - ₹20L", years_experience: "0-2 years" },
            { stage: "Smart Contract Engineer", range_usd: "$120k - $180k", range_inr: "₹20L - ₹45L", years_experience: "2-4 years" },
            { stage: "Protocol Engineer", range_usd: "$180k - $250k", range_inr: "₹45L - ₹80L", years_experience: "4+ years" },
            { stage: "Chief Architect / CTO", range_usd: "$250k - $400k+", range_inr: "₹80L - ₹2Cr+", years_experience: "6+ years" }
        ],
        interview_prep: [
            {
                question: "What is the difference between Proof of Work and Proof of Stake?",
                answer_key: "PoW uses computational power (energy) to validate blocks/secure network. PoS uses locked capital (staking). PoS is more energy efficient but introduces different security assumptions.",
                difficulty: "Beginner"
            },
            {
                question: "Explain a Reentrancy Attack.",
                answer_key: "Calling an external contract allows it to call back into the calling contract before the first execution finishes, potentially draining funds (e.g., The DAO hack). Fix: Checks-Effects-Interactions pattern.",
                difficulty: "Advanced"
            },
            {
                question: "What is Gas in Ethereum?",
                answer_key: "Unit of computation effort. Users pay gas fees (in ETH) to miners/validators to execute transactions. Prevents infinite loops and spam.",
                difficulty: "Beginner"
            }
        ],
        missing_skills: [
            { skill: "Rust", description: "For Solana/Polkadot development.", recommended_resource: "The Rust Book" },
            { skill: "Zero Knowledge Proofs", description: "Privacy scaling (zk-SNARKs).", recommended_resource: "zk-learning.org" }
        ],
        industry_trends: [
            { trend: "Layer 2 Scaling", description: "Optimistic & ZK Rollups.", skills_needed: ["Arbitrum", "Optimism SDK"] },
            { trend: "Account Abstraction", description: "Smart contract wallets (ERC-4337).", skills_needed: ["User Experience", "Bundlers"] },
            { trend: "Real World Assets (RWA)", description: "Tokenizing stocks, real estate.", skills_needed: ["Legal Wrapper", "Regulation"] }
        ],
        companies_to_target: [
            { company: "Coinbase", type: "Exchange", hiring_level: "High", typical_role: "Software Engineer" },
            { company: "Uniswap Labs", type: "DeFi", hiring_level: "Medium", typical_role: "Smart Contract Engineer" },
            { company: "Polygon", type: "L2 Protocol", hiring_level: "High", typical_role: "Protocol Dev" },
            { company: "OpenSea", type: "Marketplace", hiring_level: "Medium", typical_role: "Full Stack Web3" }
        ],
        book_recommendations: [
            { title: "Mastering Ethereum", author: "Andreas Antonopoulos", why_read: "Deep technical dive.", level: "Intermediate" },
            { title: "Token Economy", author: "Shermin Voshmgir", why_read: "Understanding value capture.", level: "Beginner" },
            { title: "The Infinite Machine", author: "Camila Russo", why_read: "History of Ethereum.", level: "Beginner" }
        ],
        online_communities: [
            { name: "Crypto Twitter", platform: "Social", link_hint: "twitter.com", benefit: "Alpha and news" },
            { name: "EthResearch", platform: "Forum", link_hint: "ethresear.ch", benefit: "Deep protocol discussions" },
            { name: "Developer DAO", platform: "Discord", link_hint: "developerdao.com", benefit: "Collaboration" }
        ],
        day_in_life: "Check gas prices and protocol health. Standup. Write comprehensive unit tests for the new staking contract using Foundry. Audit a colleague's PR for security vulnerabilities. Afternoon deep dive into a new EIP (Ethereum Improvement Proposal).",
        career_progression: [
            { level: "Web3 Frontend Dev", years: "0-2", responsibilities: "Connecting UI to Smart Contracts", skills_focus: "React, Web3.js" },
            { level: "Smart Contract Engineer", years: "2-4", responsibilities: "Writing secure on-chain logic", skills_focus: "Solidity, Security" },
            { level: "Protocol Researcher", years: "4+", responsibilities: "Designing economic incentives, consensus", skills_focus: "Math, Game Theory" }
        ]
    },
    "mobile app developer": {
        top_courses: [
            { code: "CS305", reason: "Human-Computer Interaction" },
            { code: "CS320", reason: "Data Structures (Optimization)" },
            { code: "CS470", reason: "Networking (API calls on mobile)" }
        ],
        learning_path: [
            "Programming Basics (Swift/Kotlin/Dart)",
            "UI/UX Principles for Mobile (Touch targets, Animations)",
            "State Management (Redux, Provider, Bloc)",
            "Native APIs (Camera, GPS, Sensors)",
            "Offline Storage (SQLite, Realm)",
            "App Store Deployment Process",
            "Performance Profiling"
        ],
        career_tips: [
            "Build real apps and publish them; a live store link is the best resume",
            "Focus on one platform first (iOS or Android) before going cross-platform",
            "User experience is king on mobile",
            "Keep app size small and startup time fast"
        ],
        certifications: [
            { name: "Google Associate Android Developer", issuer: "Google", difficulty: "Intermediate", cost: "$149", value: "High - Official" },
            { name: "Meta React Native Specialization", issuer: "Coursera", difficulty: "Beginner", cost: "Subscription", value: "Medium" }
        ],
        project_ideas: [
            {
                title: "Fitness Tracker",
                description: "Track steps and visualize workout data with charts.",
                difficulty: "Intermediate",
                tech_stack: ["Flutter", "Sensors API", "Charts"],
                learning_outcomes: ["Background Services", "Data Visualization"],
                time_estimate: "2 weeks"
            },
            {
                title: "Social Photo Feed",
                description: "Instagram clone with infinite scroll, likes, and comments.",
                difficulty: "Advanced",
                tech_stack: ["React Native", "Firebase", "Redux"],
                learning_outcomes: ["Complex UI", "Pagination", "Real-time DB"],
                time_estimate: "3 weeks"
            },
            {
                title: "To-Do List with Widgets",
                description: "Simple task manager with home screen widget support.",
                difficulty: "Beginner",
                tech_stack: ["Swift/Kotlin"],
                learning_outcomes: ["Native Widgets", "Local Storage"],
                time_estimate: "1 week"
            }
        ],
        salary_progression: [
            { stage: "Jr. Mobile Dev", range_usd: "$70k - $100k", range_inr: "₹6L - ₹15L", years_experience: "0-2 years" },
            { stage: "Sr. Mobile Dev", range_usd: "$120k - $160k", range_inr: "₹20L - ₹40L", years_experience: "3-5 years" },
            { stage: "Lead Mobile Engineer", range_usd: "$160k - $220k", range_inr: "₹40L - ₹70L", years_experience: "5+ years" },
            { stage: "Mobile Architect", range_usd: "$200k+", range_inr: "₹70L+", years_experience: "8+ years" }
        ],
        interview_prep: [
            {
                question: "Explain the Activity Lifecycle in Android (or View Controller in iOS).",
                answer_key: "Created -> Started -> Resumed -> Paused -> Stopped -> Destroyed. Crucial for resource management.",
                difficulty: "Beginner"
            },
            {
                question: "Difference between Native and Cross-Platform?",
                answer_key: "Native (Swift/Kotlin) has better performance and access to latest APIs. Cross-platform (React Native/Flutter) shares code between OSs but may have bridge overhead.",
                difficulty: "Intermediate"
            },
            {
                question: "How do you handle offline capability?",
                answer_key: "Local database (SQLite/Room) to cache data. Sync manager to push changes when online. Optimistic UI updates.",
                difficulty: "Intermediate"
            }
        ],
        missing_skills: [
            { skill: "Backend Basics", description: "Understanding API design.", recommended_resource: "Node.js Crash Course" },
            { skill: "Design Systems", description: "Figma to Code.", recommended_resource: "Material Design Guidelines" }
        ],
        industry_trends: [
            { trend: "Super Apps", description: "One app doing everything (payments, chat, etc).", skills_needed: ["Modular Architecture"] },
            { trend: "AR/VR Integration", description: "Augmented Reality features.", skills_needed: ["ARKit", "ARCore"] },
            { trend: "Declarative UI", description: "SwiftUI and Jetpack Compose.", skills_needed: ["Functional Programming"] }
        ],
        companies_to_target: [
            { company: "Uber", type: "Tech", hiring_level: "High", typical_role: "Mobile Engineer" },
            { company: "Spotify", type: "Consumer", hiring_level: "High", typical_role: "iOS/Android Engineer" },
            { company: "Snap", type: "Social", hiring_level: "Medium", typical_role: "Camera Kit Engineer" }
        ],
        book_recommendations: [
            { title: "Clean Architecture", author: "Robert Martin", why_read: "Writing maintainable code.", level: "Advanced" },
            { title: "Refactoring UI", author: "Adam Wathan", why_read: "Making apps look good.", level: "Beginner" }
        ],
        online_communities: [
            { name: "r/flutterdev", platform: "Reddit", link_hint: "reddit.com", benefit: "Flutter news" },
            { name: "iOS Dev Weekly", platform: "Newsletter", link_hint: "iosdevweekly.com", benefit: "Curated links" },
            { name: "Android Weekly", platform: "Newsletter", link_hint: "androidweekly.net", benefit: "Android news" }
        ],
        day_in_life: "Sync with design team on new prototype. Implement a complex animated transition for the checkout flow. Debug a crash happening only on Samsung devices. Review analytics to see where users drop off. Push build to TestFlight.",
        career_progression: [
            { level: "Jr. App Dev", years: "0-2", responsibilities: "UI implementation, bug fixes", skills_focus: "UI Frameworks" },
            { level: "Sr. Engineer", years: "3-5", responsibilities: "Architecture, Performance, CI/CD", skills_focus: "System Design" },
            { level: "Mobile Lead", years: "5+", responsibilities: "Team management, tech strategy", skills_focus: "Leadership" }
        ]
    }
};
