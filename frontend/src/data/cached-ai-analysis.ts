/**
 * Pre-cached AI Analysis Data for Indian Degree Programs
 *
 * Used when "Analyze with AI" is clicked and the plan was loaded
 * from pre-cached Indian course data (handleUsePresetCourses).
 *
 * Structure: degreeType -> specialization -> AIPlanExplanation
 */

import type { AIPlanExplanation } from "@/lib/api";

export const cachedAIAnalysis: Record<string, Record<string, AIPlanExplanation>> = {
    btech: {
        cs: {
            explanation:
                "Your B.Tech Computer Science & Engineering plan follows a well-structured progression from foundational mathematics and programming in Year 1, through core CS subjects in Year 2, advanced topics like ML and AI in Year 3, and capstone project work in Year 4. The plan effectively balances theory with hands-on lab work throughout all semesters.",
            strengths: [
                "Strong foundation in mathematics and programming from Year 1 onwards",
                "Progressive exposure to algorithms, OS, databases, and networks in Year 2",
                "Advanced AI/ML and cloud computing tracks in Year 3 and 4",
                "Includes internship and capstone project for industry readiness",
                "Lab-heavy curriculum ensuring practical skill development",
            ],
            suggestions: [
                "Consider supplementing with competitive programming practice from Year 1",
                "Start contributing to open-source projects during Year 2 internship",
                "Pursue certifications in cloud (AWS/GCP) alongside Year 3 cloud computing course",
                "Build a strong GitHub portfolio with projects from each academic year",
            ],
            key_insight:
                "Your CS plan is well-aligned for careers in software engineering, AI/ML, and cloud — industries with the highest growth in India right now.",
            career_alignment_score: 92,
            skill_gaps: [
                "DevOps and CI/CD pipelines",
                "System design at scale",
                "Competitive programming",
            ],
            strategic_electives: [
                "Deep Learning (CS401)",
                "Big Data Analytics (CS402)",
                "Professional Elective III & IV",
            ],
            difficulty_curve: "Progressive",
            projected_salary_range: "₹6L – ₹18L",
            salary_justification:
                "B.Tech CS graduates from Indian universities command ₹6–18 LPA depending on college tier and skill set. Strong AI/ML and cloud skills can push this to ₹15–25 LPA at top tech firms.",
            top_job_roles: [
                "Software Development Engineer",
                "ML Engineer",
                "Data Scientist",
                "Cloud Architect",
                "Backend Developer",
            ],
            semester_difficulty_scores: [5, 6, 7, 7, 8, 8, 7, 9],
            elevator_pitch:
                "A comprehensive B.Tech CS plan that builds you from first-principles programming all the way to production-ready AI systems — exactly what top tech companies are hiring for.",
            study_roadmap: {
                heavy_semester:
                    "Year 2 and Year 3 semesters are the heaviest — focus on algorithms, OS, and ML. Form study groups and start assignments early.",
                light_semester:
                    "Year 1 semesters are foundational — use this time to build strong coding habits and start personal projects.",
                exam_period:
                    "Prioritize DBMS, CN, and Algorithms during exams. These form the backbone of technical interviews.",
            },
            industry_relevance: {
                key_courses: [
                    "CS201 - Design and Analysis of Algorithms",
                    "CS301 - Machine Learning",
                    "CS303 - Cloud Computing",
                    "CS402 - Big Data Analytics",
                ],
                industry_connections:
                    "Algorithms and ML are directly tested in FAANG-style interviews. Cloud computing skills are in high demand at startups and MNCs alike.",
            },
            course_details: {
                "CS201": {
                    description: "Focuses on algorithm design techniques like divide and conquer, dynamic programming, and greedy methods.",
                    learning_outcomes: ["Design efficient algorithms", "Analyze time/space complexity", "Solve complex computational problems"],
                    connections: "Essential for technical interviews and forms the basis for Machine Learning (CS301) and Big Data (CS402).",
                    study_tips: "Implement every algorithm from scratch in C++ or Python. Participate in coding contests to improve problem-solving speed."
                },
                "CS301": {
                    description: "Covers supervised and unsupervised learning, neural networks, and statistical modeling techniques.",
                    learning_outcomes: ["Build predictive models", "Understand neural networks", "Apply ML to real-world datasets"],
                    connections: "Builds upon Probability (MA201) and leads directly to Deep Learning (CS401).",
                    study_tips: "Don't just use libraries (scikit-learn/TensorFlow); understand the math behind gradient descent and backpropagation."
                },
                "CS204": {
                    description: "Explores process management, memory management, file systems, and concurrency control.",
                    learning_outcomes: ["Understand kernel architecture", "Manage processes and threads", "Handle deadlocks and synchronization"],
                    connections: "Critical for understanding System Design and Cloud Computing (CS303).",
                    study_tips: "Build a small shell or scheduler to understand OS internals. Master threading concepts as they are heavily tested in interviews."
                },
                "CS202": {
                    description: "Core concepts of database design, normalization, SQL, and transaction management.",
                    learning_outcomes: ["Design normalized schemas", "Write complex SQL queries", "Understand ACID properties"],
                    connections: "The foundation for Web Technologies (CS207) and Big Data Analytics (CS402).",
                    study_tips: "Practice writing complex joins and subqueries. Learn about indexing and query optimization, as these differentiate average and top engineers."
                },
                "CS203": {
                    description: "In-depth study of the OSI model, TCP/IP stack, routing algorithms, and network protocols.",
                    learning_outcomes: ["Understand network architectures", "Analyze routing protocols", "Grasp basics of network security"],
                    connections: "Critical for distributed systems and cloud architecture roles.",
                    study_tips: "Use Wireshark to inspect actual packets and understand how protocols work in reality."
                },
                "CS402": {
                    description: "Techniques for processing large datasets using Hadoop, Spark, and modern data warehousing.",
                    learning_outcomes: ["Write MapReduce jobs", "Use Apache Spark", "Design scalable data pipelines"],
                    connections: "Natural progression from DBMS (CS202) and Machine Learning (CS301).",
                    study_tips: "Set up a local Hadoop/Spark cluster and process a multi-gigabyte dataset to understand the bottlenecks."
                }
            },
        },
        it: {
            explanation:
                "Your B.Tech IT plan is strongly focused on web technologies, networking, system administration, and emerging areas like IoT and DevOps. The curriculum transitions from fundamentals to practical IT management and cloud-based systems by Year 4.",
            strengths: [
                "Strong emphasis on networking, web development, and system administration",
                "Practical labs in DBMS, OS, and networks from Year 2",
                "Modern topics: Cloud Computing, IoT, DevOps in Years 3–4",
                "Summer internship and industry internship for real-world exposure",
                "Good coverage of data mining and information security",
            ],
            suggestions: [
                "Add Linux/Ubuntu system administration practice from Year 2",
                "Get certified in networking (CCNA) alongside Computer Networks course",
                "Build full-stack web projects during the Web Technologies module",
                "Explore DevOps tools (Docker, Kubernetes) early for better Year 4 placement",
            ],
            key_insight:
                "IT graduates with networking + cloud + security skills are among the most sought-after profiles in Indian IT services companies and startups.",
            career_alignment_score: 88,
            skill_gaps: [
                "Containerization and Kubernetes",
                "Cybersecurity certifications",
                "Full-stack development experience",
            ],
            strategic_electives: [
                "IT401 - Internet of Things",
                "IT402 - DevOps and Automation",
                "Professional Electives III & IV",
            ],
            difficulty_curve: "Steady",
            projected_salary_range: "₹4L – ₹14L",
            salary_justification:
                "B.Tech IT graduates in India typically start at ₹4–8 LPA and can reach ₹12–18 LPA with cloud, DevOps, or cybersecurity specializations.",
            top_job_roles: [
                "Systems Administrator",
                "Network Engineer",
                "Cloud Engineer",
                "Full-Stack Developer",
                "IT Security Analyst",
            ],
            semester_difficulty_scores: [5, 6, 7, 7, 8, 7, 7, 8],
            elevator_pitch:
                "A solid B.Tech IT plan combining networking fundamentals with modern DevOps and IoT — building the infrastructure engineers that every company needs.",
            study_roadmap: {
                heavy_semester:
                    "Year 2 is the heaviest with OS, networking, and DBMS. Set up a home lab with Linux VMs to practice hands-on.",
                light_semester:
                    "Year 1 builds fundamentals. Use this time to get comfortable with Linux and basic networking tools.",
                exam_period:
                    "Focus on Computer Networks, OS, and DBMS — these are core IT interview topics.",
            },
            industry_relevance: {
                key_courses: [
                    "IT303 - Cloud Computing",
                    "IT402 - DevOps and Automation",
                    "IT401 - Internet of Things",
                    "IT302 - Network Security",
                ],
                industry_connections:
                    "Cloud and DevOps skills are critical for IT service companies (TCS, Infosys, Wipro) and startups. IoT is a growing domain in manufacturing and smart cities.",
            },
            course_details: {
                "IT303": {
                    description: "Covers cloud architectures, virtualization, and services (IaaS, PaaS, SaaS) using AWS/GCP paradigms.",
                    learning_outcomes: ["Deploy applications on the cloud", "Understand virtualization concepts", "Design scalable architectures"],
                    connections: "Builds on Computer Networks (IT203) and leads into DevOps (IT402).",
                    study_tips: "Create a free tier account on AWS/GCP and manually deploy web applications. Theory alone is insufficient for cloud skills."
                },
                "IT402": {
                    description: "Focuses on continuous integration/continuous deployment (CI/CD), infrastructure as code, and containerization.",
                    learning_outcomes: ["Build CI/CD pipelines", "Use Docker and Kubernetes", "Automate infrastructure deployment"],
                    connections: "The culmination of System Administration (IT207) and Cloud Computing (IT303).",
                    study_tips: "Set up a full pipeline for a personal project using GitHub Actions, Docker, and a basic cloud server."
                },
                "IT203": {
                    description: "In-depth study of the OSI model, TCP/IP stack, routing algorithms, and network protocols.",
                    learning_outcomes: ["Analyze network protocols", "Configure basic routers/switches", "Understand network security fundamentals"],
                    connections: "Foundation for Network Security (IT302) and Cloud Computing (IT303).",
                    study_tips: "Use Wireshark to analyze packet flows. Set up local networks using Cisco Packet Tracer to visualize concepts."
                },
                "IT206": {
                    description: "Comprehensive introduction to frontend and backend web development technologies.",
                    learning_outcomes: ["Build responsive frontends", "Develop RESTful APIs", "Connect applications to databases"],
                    connections: "Requires Java (IT104) and DBMS (IT202) knowledge. Highly applicable for internships.",
                    study_tips: "Build a complete, deployed web application (e.g., an e-commerce clone). Focus on building a robust backend API."
                },
                "IT202": {
                    description: "Core concepts of database design, normalization, SQL, and transaction management.",
                    learning_outcomes: ["Design normalized schemas", "Write complex SQL queries", "Understand ACID properties"],
                    connections: "The foundation for Web Technologies (IT206) and Data Mining.",
                    study_tips: "Practice writing complex joins and subqueries. Learn about indexing and query optimization."
                },
                "IT401": {
                    description: "Architecture of IoT systems, sensor networks, communication protocols (MQTT), and cloud integration.",
                    learning_outcomes: ["Interface sensors", "Implement MQTT protocols", "Connect physical devices to the cloud"],
                    connections: "Combines networking (IT203) with practical edge computing.",
                    study_tips: "Build a physical IoT project using an ESP32 or Raspberry Pi connected to AWS IoT."
                }
            },
        },
        ece: {
            explanation:
                "Your B.Tech ECE plan builds a strong foundation in analog/digital electronics, signals, and communication systems, progressing to advanced topics in wireless communication, embedded systems, and VLSI design. The plan is ideal for both core electronics roles and software-adjacent careers.",
            strengths: [
                "Deep grounding in circuit theory, signals, and electromagnetic theory",
                "Advanced communication systems: digital, wireless, and optical",
                "Strong VLSI and embedded systems tracks for hardware careers",
                "Lab-intensive curriculum with dedicated DSP and microprocessor labs",
                "Internship for practical industry exposure",
            ],
            suggestions: [
                "Learn Python/MATLAB for signal processing to complement DSP coursework",
                "Work on Arduino/Raspberry Pi projects alongside Embedded Systems course",
                "Pursue GATE preparation from Year 3 for M.Tech/PSU opportunities",
                "Consider firmware development projects to bridge hardware-software gap",
            ],
            key_insight:
                "ECE graduates with embedded systems and VLSI skills are in high demand at semiconductor companies, defense PSUs, and telecom firms.",
            career_alignment_score: 85,
            skill_gaps: [
                "Python/MATLAB for signal processing",
                "PCB design software (KiCad/Altium)",
                "RTL coding with Verilog/VHDL",
            ],
            strategic_electives: [
                "EC403 - CMOS VLSI Design",
                "EC401 - Radar Systems",
                "Professional Electives III & IV",
            ],
            difficulty_curve: "Steep",
            projected_salary_range: "₹4L – ₹16L",
            salary_justification:
                "ECE graduates in India earn ₹4–8 LPA in core electronics roles, but VLSI/embedded specialists at semiconductor firms (Qualcomm, Intel, Texas Instruments) earn ₹12–25 LPA.",
            top_job_roles: [
                "Embedded Systems Engineer",
                "VLSI Design Engineer",
                "RF/Communication Engineer",
                "Hardware Design Engineer",
                "DSP Engineer",
            ],
            semester_difficulty_scores: [6, 7, 8, 8, 9, 8, 8, 9],
            elevator_pitch:
                "A rigorous B.Tech ECE plan covering the full spectrum from analog circuits to advanced wireless systems — preparing you for India's growing semiconductor and telecom industry.",
            study_roadmap: {
                heavy_semester:
                    "Year 2 and 3 are extremely demanding with DSP, communications, and VLSI. Focus on understanding fundamentals over rote learning.",
                light_semester:
                    "Year 1 introduces core concepts. Build a strong base in circuit theory and mathematics — it directly supports all future subjects.",
                exam_period:
                    "Analog Electronics, Communication Systems, and VLSI Design are the most critical for placements and GATE.",
            },
            industry_relevance: {
                key_courses: [
                    "EC211 - VLSI Design",
                    "EC303 - Embedded Systems",
                    "EC304 - Wireless Communication",
                    "EC202 - Digital Signal Processing",
                ],
                industry_connections:
                    "VLSI and embedded systems skills are directly applicable at semiconductor companies (Qualcomm, MediaTek, ISRO). Wireless skills are valued at telecom firms (Ericsson, Nokia, BSNL).",
            },
            course_details: {
                "EC211": {
                    description: "Covers CMOS logic, fabrication processes, layout design, and timing analysis of digital circuits.",
                    learning_outcomes: ["Design CMOS layouts", "Analyze circuit timing/delay", "Understand semiconductor physics"],
                    connections: "Builds on Digital Electronics (EC105). Essential for hardware roles at semiconductor companies.",
                    study_tips: "Master MOSFET operation first. Practice drawing gate-level schematics and their corresponding physical layouts."
                },
                "EC303": {
                    description: "Focuses on microcontrollers (ARM/8051), interfacing sensors/actuators, and real-time operating systems.",
                    learning_outcomes: ["Program microcontrollers in C", "Interface peripherals", "Design RTOS-based applications"],
                    connections: "Bridges Microprocessors (EC205) with IoT (EC402). Highly practical course.",
                    study_tips: "Buy an Arduino or STM32 development board and build a physical project. Embedded systems cannot be learned from textbooks alone."
                },
                "EC202": {
                    description: "Mathematical foundation for processing digital signals, covering Z-transforms, FFTs, and filter design (IIR/FIR).",
                    learning_outcomes: ["Design digital filters", "Compute Fourier transforms", "Analyze discrete-time systems"],
                    connections: "Heavy math course building on Signals and Systems (EC201). Used heavily in telecommunications.",
                    study_tips: "Use MATLAB or Python (SciPy) to plot signals and apply filters to audio files. Visualizing DSP concepts makes the math intuitive."
                },
                "EC304": {
                    description: "Cellular concepts, mobile radio propagation, fading, and modern 4G/5G architectures.",
                    learning_outcomes: ["Analyze cellular network capacity", "Understand OFDM/MIMO", "Design basic RF links"],
                    connections: "Builds on Communication Systems. Crucial for careers at telecom operators and equipment vendors.",
                    study_tips: "Focus on the mathematical modeling of fading channels. Read whitepapers on 5G NR to bridge theory and current industry."
                },
                "EC105": {
                    description: "Boolean algebra, combinational/sequential logic circuits, and state machines.",
                    learning_outcomes: ["Simplify logic expressions", "Design flip-flops and counters", "Implement finite state machines"],
                    connections: "The foundation for Microprocessors (EC205) and VLSI Design (EC211).",
                    study_tips: "Use Logisim to simulate circuits before building them on breadboards. Master Karnaugh maps."
                },
                "EC403": {
                    description: "Advanced study of CMOS circuits, delay modeling, power dissipation, and layout techniques.",
                    learning_outcomes: ["Design complex CMOS gates", "Analyze power-delay trade-offs", "Perform physical layout verification"],
                    connections: "Advanced continuation of VLSI Design (EC211).",
                    study_tips: "Use tools like Cadence or LTSpice for schematic simulation. Focus heavily on timing closure concepts."
                }
            },
        },
        ee: {
            explanation:
                "Your B.Tech Electrical Engineering plan provides comprehensive coverage of circuit theory, power systems, control systems, and renewable energy. The progression from electrical machines in Year 1 to smart grid technology and EVs in Year 4 reflects modern industry needs.",
            strengths: [
                "Strong foundation in circuit theory, electromagnetics, and electrical machines",
                "Comprehensive power systems coverage including protection and distribution",
                "Modern topics: Renewable Energy and Smart Grid Technology",
                "Electric Vehicles specialization aligned with India's EV push",
                "Lab-intensive curriculum with dedicated power and control labs",
            ],
            suggestions: [
                "Learn MATLAB/Simulink for power system simulation alongside coursework",
                "Pursue GATE EE preparation from Year 3 for PSU (NTPC, BHEL, PGCIL) opportunities",
                "Get hands-on with PLC/SCADA systems for industrial automation roles",
                "Follow developments in renewable energy (solar/wind) for emerging opportunities",
            ],
            key_insight:
                "EE graduates are essential to India's power infrastructure and the rapidly growing renewable energy and EV sectors.",
            career_alignment_score: 83,
            skill_gaps: [
                "MATLAB/Simulink simulation",
                "PLC and SCADA programming",
                "Power electronics for EV charging",
            ],
            strategic_electives: [
                "EE401 - Smart Grid Technology",
                "EE402 - Electric Vehicles",
                "Professional Electives III & IV",
            ],
            difficulty_curve: "Steep",
            projected_salary_range: "₹4L – ₹14L",
            salary_justification:
                "EE graduates earn ₹4–7 LPA in core electrical roles. PSU selections (GATE-based) offer ₹8–15 LPA, and renewable energy/EV sector roles command ₹10–20 LPA.",
            top_job_roles: [
                "Power Systems Engineer",
                "Control Systems Engineer",
                "EV Systems Engineer",
                "Renewable Energy Analyst",
                "Electrical Design Engineer",
            ],
            semester_difficulty_scores: [6, 7, 8, 8, 9, 8, 8, 8],
            elevator_pitch:
                "A strong B.Tech EE plan that moves from classical power systems to India's energy future — smart grids and electric vehicles.",
            study_roadmap: {
                heavy_semester:
                    "Year 2 and 3 feature power systems, control systems, and protection — the core of the EE curriculum. Use MATLAB Simulink for all simulations.",
                light_semester:
                    "Year 1 builds electrical fundamentals. Master circuit theory and electrical machines early — everything else builds on these.",
                exam_period:
                    "Power Systems, Control Systems, and Electrical Machines are critical for GATE EE and campus placements.",
            },
            industry_relevance: {
                key_courses: [
                    "EE301 - Power Systems Analysis",
                    "EE303 - Renewable Energy Systems",
                    "EE402 - Electric Vehicles",
                    "EE401 - Smart Grid Technology",
                ],
                industry_connections:
                    "Power systems skills are needed at NTPC, BHEL, PGCIL. Renewable and EV expertise is valued at Tata Power, Ola Electric, Adani Green Energy.",
            },
            course_details: {
                "EE301": {
                    description: "Analysis of interconnected power systems, covering load flow, fault calculations, and system stability.",
                    learning_outcomes: ["Perform load flow analysis", "Calculate symmetrical/unsymmetrical faults", "Analyze transient stability"],
                    connections: "Core course building on Circuit Theory (EE103) and Machines (EE201). Vital for PSUs.",
                    study_tips: "Solve numericals systematically. Get comfortable with per-unit systems as they simplify complex power network calculations."
                },
                "EE402": {
                    description: "Covers EV architecture, battery management systems, motor drives, and charging infrastructure.",
                    learning_outcomes: ["Understand EV powertrain", "Design basic BMS", "Analyze charging protocols"],
                    connections: "Modern application of Power Electronics (EE204) and Control Systems (EE202).",
                    study_tips: "Follow industry trends (e.g., Tesla, Ather architectures). Focus deeply on lithium-ion battery chemistry and thermal management."
                },
                "EE202": {
                    description: "Study of feedback systems, root locus, Bode plots, state-space analysis, and PID controllers.",
                    learning_outcomes: ["Design PID controllers", "Analyze system stability", "Create state-space models"],
                    connections: "Highly mathematical course applicable across EE, ME, and aerospace domains.",
                    study_tips: "Use MATLAB/Simulink extensively. Don't memorize Bode plot shapes; understand how poles and zeros affect the frequency response."
                },
                "EE303": {
                    description: "Solar PV, wind energy, biomass, and integration of renewable sources into the grid.",
                    learning_outcomes: ["Model solar PV systems", "Analyze wind turbine generators", "Understand MPPT algorithms"],
                    connections: "Applies Power Electronics (EE204) to modern energy sources.",
                    study_tips: "Focus on the power converters used in renewables. Learn PVsyst software if possible."
                },
                "EE401": {
                    description: "Modernization of power grids with communication networks, smart meters, and demand-side management.",
                    learning_outcomes: ["Understand smart meter architectures", "Analyze microgrids", "Implement basic demand response"],
                    connections: "Merges Power Systems (EE301) with basic networking and IoT concepts.",
                    study_tips: "Read case studies of smart grid implementations in real cities. Understand the role of cybersecurity in grid operations."
                }
            },
        },
        me: {
            explanation:
                "Your B.Tech Mechanical Engineering plan covers a comprehensive range from engineering mechanics and thermodynamics in Year 1 to advanced topics like robotics, renewable energy, and CAD/CAM by Year 4. The plan balances core mechanical theory with modern manufacturing and automation.",
            strengths: [
                "Strong thermodynamics, fluid mechanics, and heat transfer foundation",
                "Practical manufacturing and workshop training from Year 1",
                "Advanced topics: Robotics, CAD/CAM, and Renewable Energy in Year 4",
                "Design-focused curriculum with machine design and CAD labs",
                "Internship and major project for industry exposure",
            ],
            suggestions: [
                "Learn SolidWorks/CATIA/AutoCAD alongside engineering drawing coursework",
                "Pursue GATE ME preparation for PSU (BHEL, ISRO, HAL) opportunities",
                "Get hands-on with 3D printing and additive manufacturing",
                "Consider robotics projects for emerging automation industry roles",
            ],
            key_insight:
                "ME graduates with CAD/CAM and robotics skills are increasingly valuable as India's manufacturing sector automates under the Make in India initiative.",
            career_alignment_score: 81,
            skill_gaps: [
                "CAD software (SolidWorks/CATIA)",
                "FEM/FEA simulation (ANSYS)",
                "Python/MATLAB for engineering calculations",
            ],
            strategic_electives: [
                "ME401 - Robotics and Automation",
                "ME402 - Renewable Energy Sources",
                "Professional Electives III & IV",
            ],
            difficulty_curve: "Progressive",
            projected_salary_range: "₹3.5L – ₹12L",
            salary_justification:
                "ME graduates earn ₹3.5–6 LPA in core manufacturing roles. Automotive, aerospace, and robotics specialists earn ₹8–18 LPA at companies like Tata Motors, L&T, ISRO.",
            top_job_roles: [
                "Design Engineer",
                "Manufacturing Engineer",
                "Thermal Engineer",
                "Robotics Engineer",
                "Project Manager (Manufacturing)",
            ],
            semester_difficulty_scores: [6, 7, 7, 8, 8, 8, 7, 8],
            elevator_pitch:
                "A well-rounded B.Tech ME plan bridging traditional mechanical engineering with modern robotics and renewable energy — ready for India's evolving manufacturing landscape.",
            study_roadmap: {
                heavy_semester:
                    "Year 2 and 3 are demanding with fluid mechanics, heat transfer, and design subjects. Pair theory with lab practice for best results.",
                light_semester:
                    "Year 1 establishes mechanics and thermodynamics foundations. Master these — they underpin 80% of ME subjects.",
                exam_period:
                    "Fluid Mechanics, Thermodynamics, and Theory of Machines are GATE ME staples and critical for placement preparation.",
            },
            industry_relevance: {
                key_courses: [
                    "ME301 - Design of Machine Elements",
                    "ME401 - Robotics and Automation",
                    "ME205 - Machine Drawing and CAD",
                    "ME303 - Operations Research",
                ],
                industry_connections:
                    "Design and manufacturing skills are needed at Tata Motors, Mahindra, L&T. Robotics expertise is valued at automation companies like ABB, Fanuc, and Honeywell.",
            },
            course_details: {
                "ME301": {
                    description: "Design of shafts, gears, bearings, and springs under static and fatigue loading conditions.",
                    learning_outcomes: ["Calculate stress and strain", "Design mechanical components for safety", "Analyze failure criteria"],
                    connections: "Builds on Strength of Materials (ME201). Essential for design engineering roles.",
                    study_tips: "Familiarize yourself with the design data book. Practice selecting standard components (bearings, gears) from manufacturer catalogs."
                },
                "ME401": {
                    description: "Covers robot kinematics, dynamics, trajectory planning, and control of robotic manipulators.",
                    learning_outcomes: ["Calculate forward/inverse kinematics", "Program basic robot trajectories", "Understand sensor integration"],
                    connections: "Combines Theory of Machines (ME204) with basic programming.",
                    study_tips: "Learn Python or C++ and use ROS (Robot Operating System) to simulate robotic arms. Math (matrix transformations) is critical here."
                },
                "ME104": {
                    description: "Fundamental laws of thermodynamics, properties of pure substances, and power cycles (Otto, Diesel, Rankine).",
                    learning_outcomes: ["Apply first and second laws", "Calculate thermal efficiency", "Analyze power/refrigeration cycles"],
                    connections: "The absolute foundation for Heat Transfer (ME203) and IC Engines (ME302).",
                    study_tips: "Master the use of steam tables and Mollier charts. Understand the physical meaning of entropy rather than just the mathematical formula."
                },
                "ME205": {
                    description: "Computer-Aided Design (CAD), solid modeling, assembly design, and GD&T.",
                    learning_outcomes: ["Create 3D parametric models", "Generate engineering drawings", "Apply GD&T principles"],
                    connections: "The modern evolution of Engineering Graphics (ME101). Essential for all design roles.",
                    study_tips: "Achieve fluency in SolidWorks or CATIA. Take the CSWA/CSWP certification exams to prove your skills to employers."
                },
                "ME303": {
                    description: "Optimization techniques including linear programming, transportation models, and queuing theory.",
                    learning_outcomes: ["Formulate LP problems", "Solve optimization models", "Analyze queuing systems"],
                    connections: "Highly mathematical course crucial for manufacturing, logistics, and supply chain roles.",
                    study_tips: "Use Excel Solver or Python (SciPy/PuLP) to solve large problems rather than doing them all by hand."
                }
            },
        },
    },
    bca: {
        general: {
            explanation:
                "Your BCA plan provides a solid three-year foundation in computer applications, covering programming from fundamentals to advanced Java and Python, database management, networking, and modern topics like mobile app development, data science, and machine learning in the final year.",
            strengths: [
                "Strong programming progression: C++ → Java → Python in Years 1–2",
                "Comprehensive web development track with HTML/CSS to full web technologies",
                "Modern capstone topics: Mobile Dev, Data Science, ML, Cloud in Year 3",
                "Includes summer internship and industry internship for practical exposure",
                "Good balance of theory and lab-based learning",
            ],
            suggestions: [
                "Build a portfolio of web applications from Year 1 onwards",
                "Contribute to open-source projects during Year 2 Summer Internship",
                "Start learning React/Node.js alongside Web Technologies for full-stack skills",
                "Pursue cloud certifications (AWS/Azure) alongside BCA303 Cloud Computing",
            ],
            key_insight:
                "BCA graduates with full-stack development and data science skills are highly competitive in India's growing startup ecosystem.",
            career_alignment_score: 84,
            skill_gaps: [
                "Modern JavaScript frameworks (React, Node.js)",
                "Version control and CI/CD",
                "System design fundamentals",
            ],
            strategic_electives: [
                "BCA301 - Mobile Application Development",
                "BCA302 - Data Science and Analytics",
                "BCA305 - Machine Learning",
            ],
            difficulty_curve: "Progressive",
            projected_salary_range: "₹3L – ₹10L",
            salary_justification:
                "BCA graduates start at ₹3–5 LPA in IT support/junior developer roles. Full-stack or data science specialists earn ₹7–14 LPA at product companies.",
            top_job_roles: [
                "Junior Software Developer",
                "Web Developer",
                "Data Analyst",
                "Mobile App Developer",
                "IT Support Engineer",
            ],
            semester_difficulty_scores: [5, 6, 6, 7, 7, 8],
            elevator_pitch:
                "A focused BCA plan that builds you from programming basics to data science and mobile development in just three years — ready for India's IT industry.",
            study_roadmap: {
                heavy_semester:
                    "Year 2 introduces multiple languages and frameworks simultaneously. Focus on one project per subject to reinforce each concept.",
                light_semester:
                    "Year 1 builds programming foundations. Practice daily coding challenges to build speed and confidence.",
                exam_period:
                    "Java, DBMS, and Web Technologies are the most commonly tested topics in BCA placement drives.",
            },
            industry_relevance: {
                key_courses: [
                    "BCA201 - Java Programming",
                    "BCA302 - Data Science and Analytics",
                    "BCA303 - Cloud Computing",
                    "BCA305 - Machine Learning",
                ],
                industry_connections:
                    "Java and Python skills are essential for IT service companies. Data science and ML expertise opens doors at analytics firms and product startups.",
            },
            course_details: {
                "BCA201": {
                    description: "Object-oriented programming using Java, covering classes, inheritance, polymorphism, exceptions, and collections.",
                    learning_outcomes: ["Write clean OOP code", "Use Java Collection Framework", "Build simple desktop applications"],
                    connections: "Essential foundation for Advanced Java (BCA204) and enterprise software development.",
                    study_tips: "Build terminal-based games or management systems (like a Library System) to understand class interactions."
                },
                "BCA302": {
                    description: "Introduction to data analytics using Python, Pandas, and visualization libraries (Matplotlib/Seaborn).",
                    learning_outcomes: ["Clean and preprocess data", "Perform exploratory data analysis", "Create insightful dashboards"],
                    connections: "Leads directly into Machine Learning (BCA305).",
                    study_tips: "Download public datasets from Kaggle and practice answering business questions using Python visualizations."
                },
                "BCA203": {
                    description: "Web development basics covering HTML5, CSS3, JavaScript, and responsive design frameworks.",
                    learning_outcomes: ["Build responsive web pages", "Manipulate the DOM with JS", "Understand HTTP protocols"],
                    connections: "The prerequisite for full-stack projects. Pairs well with DBMS (BCA105).",
                    study_tips: "Don't rely heavily on frameworks like Bootstrap initially. Learn raw CSS Flexbox and Grid first."
                }
            },
        },
    },
    mca: {
        general: {
            explanation:
                "Your MCA plan is a rigorous two-year postgraduate program covering advanced data structures, OS, networks, web technologies, and culminating in machine learning, cloud computing, big data, and a major project. Designed for graduates transitioning into software engineering or data roles.",
            strengths: [
                "Advanced DSA and algorithm foundations from Day 1",
                "Comprehensive systems coverage: OS, networks, databases",
                "Strong AI/ML focus in Year 2 with machine learning and big data",
                "Theory of Computation and Compiler Design for strong CS fundamentals",
                "Industry Internship and Major Project for industry readiness",
            ],
            suggestions: [
                "Start LeetCode/competitive programming alongside Advanced DSA",
                "Build full-stack projects using Web Technologies coursework",
                "Pursue cloud certifications (AWS/GCP) during Year 2",
                "Target product companies and analytics startups for placement",
            ],
            key_insight:
                "MCA graduates with ML and cloud skills command salaries competitive with B.Tech CS graduates at top IT companies.",
            career_alignment_score: 89,
            skill_gaps: [
                "System design and scalability",
                "Cloud-native architecture",
                "Production ML deployment (MLOps)",
            ],
            strategic_electives: [
                "MCA201 - Machine Learning",
                "MCA202 - Cloud Computing and Virtualization",
                "MCA203 - Big Data Analytics",
            ],
            difficulty_curve: "Steep",
            projected_salary_range: "₹5L – ₹18L",
            salary_justification:
                "MCA graduates from reputed institutions earn ₹5–10 LPA. ML/cloud specialists at product companies and MNCs earn ₹12–22 LPA.",
            top_job_roles: [
                "Software Engineer",
                "Data Scientist",
                "Cloud Solutions Architect",
                "Big Data Engineer",
                "ML Engineer",
            ],
            semester_difficulty_scores: [8, 9, 9, 10],
            elevator_pitch:
                "An intensive MCA plan that fast-tracks you from advanced CS theory to production-ready ML and cloud engineering in two years.",
            study_roadmap: {
                heavy_semester:
                    "Year 1 is extremely demanding — 25 subjects. Set up a strict weekly schedule and prioritize DSA and databases.",
                light_semester:
                    "Year 2 is project-heavy. Use this time to build impactful ML and cloud projects for your portfolio.",
                exam_period:
                    "Advanced DSA, DBMS, ML, and Cloud Computing are the core topics for MCA placement interviews.",
            },
            industry_relevance: {
                key_courses: [
                    "MCA201 - Machine Learning",
                    "MCA202 - Cloud Computing and Virtualization",
                    "MCA203 - Big Data Analytics",
                    "MCA101 - Advanced Data Structures",
                ],
                industry_connections:
                    "Machine learning and big data skills are directly applicable at analytics companies (Mu Sigma, Fractal) and tech MNCs (Microsoft, Amazon, Google India).",
            },
            course_details: {
                "MCA101": {
                    description: "Advanced algorithms and data structures including balanced trees (AVL/Red-Black), graphs, and dynamic programming.",
                    learning_outcomes: ["Optimize algorithm efficiency", "Implement advanced tree structures", "Solve competitive programming problems"],
                    connections: "The most critical course for cracking product company coding interviews.",
                    study_tips: "Solve at least 100 LeetCode problems (Medium/Hard) focusing on trees, graphs, and dynamic programming."
                },
                "MCA201": {
                    description: "Comprehensive study of ML algorithms, from linear regression and SVMs to basic neural networks.",
                    learning_outcomes: ["Train and evaluate ML models", "Understand bias-variance tradeoff", "Apply Scikit-Learn to real data"],
                    connections: "Builds on Python (MCA104) and leads to Big Data (MCA203).",
                    study_tips: "Focus heavily on the mathematical intuition behind the algorithms, not just calling library functions."
                },
                "MCA202": {
                    description: "Enterprise cloud architecture, focusing on AWS/Azure, Docker, Kubernetes, and serverless computing.",
                    learning_outcomes: ["Deploy scalable microservices", "Manage Kubernetes clusters", "Understand cloud economics"],
                    connections: "Essential for modern backend roles and DevOps transitions.",
                    study_tips: "Deploy your Year 1 mini-project as a set of Dockerized microservices on AWS EC2/EKS."
                }
            },
        },
        ai: {
            explanation:
                "Your MCA (AI & Data Science) plan is a highly specialized two-year program focused entirely on artificial intelligence, deep learning, NLP, and computer vision. It's designed to produce job-ready AI engineers and data scientists.",
            strengths: [
                "Dedicated AI fundamentals from Year 1 — no catch-up required",
                "Full deep learning, NLP, and computer vision stack in Year 2",
                "Python, R, and data visualization built-in for data science careers",
                "Ethics and research methodology included for responsible AI",
                "AI Major Project/Thesis for a strong portfolio piece",
            ],
            suggestions: [
                "Participate in Kaggle competitions from Month 1",
                "Publish a research paper or technical blog based on your thesis",
                "Build end-to-end ML pipelines using MLflow/Weights & Biases",
                "Pursue TensorFlow/PyTorch certifications alongside coursework",
            ],
            key_insight:
                "AI-specialized MCA graduates are one of the most in-demand profiles in India right now, with generative AI opening new salary bands.",
            career_alignment_score: 95,
            skill_gaps: [
                "MLOps and production deployment",
                "Generative AI (LLMs, RAG systems)",
                "Cloud ML platforms (SageMaker, Vertex AI)",
            ],
            strategic_electives: [
                "MCA201 - Deep Learning",
                "MCA202 - Computer Vision",
                "MCA203 - Advanced NLP",
                "PE201 - Reinforcement Learning / MLOps",
            ],
            difficulty_curve: "Steep",
            projected_salary_range: "₹8L – ₹28L",
            salary_justification:
                "AI-specialized MCA graduates earn ₹8–15 LPA at Indian AI startups and analytics firms. At MNCs (Google, Microsoft, Meta India) and in generative AI roles, packages reach ₹20–40 LPA.",
            top_job_roles: [
                "Machine Learning Engineer",
                "Deep Learning Researcher",
                "NLP Engineer",
                "Computer Vision Engineer",
                "AI Product Engineer",
            ],
            semester_difficulty_scores: [8, 9, 10, 10],
            elevator_pitch:
                "A cutting-edge MCA AI plan that takes you from Python and statistics straight to deep learning, NLP, and computer vision — the exact skills companies are hiring for at premium salaries.",
            study_roadmap: {
                heavy_semester:
                    "Both years are intense. Year 2 features multiple specialized AI tracks simultaneously — manage time carefully and focus on project quality.",
                light_semester:
                    "Year 1 foundations in Python, R, and math are non-negotiable. Every AI concept you'll study depends on these.",
                exam_period:
                    "Machine Learning fundamentals, Deep Learning architectures, and NLP concepts are the core interview topics for AI roles.",
            },
            industry_relevance: {
                key_courses: [
                    "MCA201 - Deep Learning",
                    "MCA202 - Computer Vision",
                    "MCA203 - Advanced NLP",
                    "MCA107 - Python for AI and ML",
                ],
                industry_connections:
                    "Deep learning and NLP skills are directly required at AI startups (Sarvam AI, Krutrim), MNCs (Google DeepMind India, Microsoft Research), and MAANG companies.",
            },
            course_details: {
                "MCA201": {
                    description: "Deep dive into artificial neural networks, backpropagation, CNNs, RNNs, and transformer architectures.",
                    learning_outcomes: ["Build deep neural networks", "Optimize hyperparameters", "Use PyTorch/TensorFlow effectively"],
                    connections: "The core of modern AI. Prerequisite for NLP (MCA203) and Vision (MCA202).",
                    study_tips: "Implement a simple neural network from scratch in NumPy before moving to PyTorch. Understand gradients deeply."
                },
                "MCA203": {
                    description: "Advanced NLP focusing on word embeddings, sequence-to-sequence models, attention mechanisms, and Large Language Models (LLMs).",
                    learning_outcomes: ["Process text data", "Train language models", "Fine-tune pre-trained LLMs"],
                    connections: "Directly applicable to the current Generative AI industry boom.",
                    study_tips: "Use HuggingFace's `transformers` library. Try fine-tuning a small open-source LLM on a custom dataset."
                },
                "MCA102": {
                    description: "Advanced statistics and probability required for machine learning, including Bayesian inference and hypothesis testing.",
                    learning_outcomes: ["Understand probability distributions", "Perform statistical significance tests", "Apply Bayes' theorem to ML"],
                    connections: "The mathematical backbone that distinguishes actual Data Scientists from library-callers.",
                    study_tips: "Don't rush the math. A strong statistical foundation makes debugging complex ML models significantly easier."
                }
            },
        },
    },
};

/**
 * Check if cached AI analysis is available for a given degree/specialization combo.
 */
export function getCachedAnalysis(
    degreeType: string | null,
    specialization: string | null
): AIPlanExplanation | null {
    if (!degreeType || !specialization) return null;
    return cachedAIAnalysis[degreeType]?.[specialization] ?? null;
}
