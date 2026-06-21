// Gemini AI Service Module

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const isGeminiConfigured = Boolean(API_KEY && !API_KEY.includes("your-api-key"));

export interface AnalysisResponse {
  atsScore: number;
  jdMatch: number;
  resumeHealth: number;
  keywordCoverage: number;
  foundKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  atsRisks: string[];
  suggestions: string[];
  sectionScores: {
    summary: number;
    skills: number;
    projects: number;
    experience: number;
    education: number;
    achievements: number;
  };
  rewrites: {
    summary: string;
    skills: string[];
    experience: string[];
    projects: string[];
    achievements: string[];
  };
}

/**
 * Analyzes resume text against a job description.
 */
export async function analyzeResume(resumeText: string, jdText: string): Promise<AnalysisResponse> {
  if (!isGeminiConfigured) {
    console.warn("[Gemini] API Key missing/invalid. Simulating AI analysis.");
    return simulateAnalysis(resumeText, jdText);
  }

  const prompt = `
You are an expert Applicant Tracking System (ATS) auditor and hiring manager.
Compare the following resume text against the provided Job Description.

Analyze the resume for:
1. ATS score (formatting, structure, readability)
2. Job Description matching (skills, keywords, qualifications)
3. Resume Health (action verbs, results-oriented, metrics)
4. Strengths, weaknesses, and clear ATS formatting risks
5. Specific suggestions for improvement
6. Content rewrites:
   - Provide an optimized professional summary rewrite.
   - Provide optimized resume bullets for skills list, work experiences, projects, and achievements.

You MUST respond with a single, strictly valid JSON object matching the following structure. Do not wrap the JSON in markdown code blocks like \`\`\`json ... \`\`\` or include any text before or after the JSON.

Expected JSON Structure:
{
  "atsScore": number (0 to 100),
  "jdMatch": number (0 to 100),
  "resumeHealth": number (0 to 100),
  "keywordCoverage": number (0 to 100),
  "foundKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword3", "keyword4"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "atsRisks": ["risk1", "risk2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "sectionScores": {
    "summary": number (0 to 100),
    "skills": number (0 to 100),
    "projects": number (0 to 100),
    "experience": number (0 to 100),
    "education": number (0 to 100),
    "achievements": number (0 to 100)
  },
  "rewrites": {
    "summary": "String optimized resume summary",
    "skills": ["Optimized skill list bullet 1", "Optimized skill list bullet 2"],
    "experience": ["Optimized work experience bullet 1", "Optimized work experience bullet 2"],
    "projects": ["Optimized project description bullet 1", "Optimized project description bullet 2"],
    "achievements": ["Optimized achievement bullet 1", "Optimized achievement bullet 2"]
  }
}

Resume Text:
${resumeText}

Job Description:
${jdText}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini model");
    }

    const parsedData: AnalysisResponse = JSON.parse(rawJson);

    // Schema validation and default values fallback
    return {
      atsScore: Number(parsedData.atsScore || 70),
      jdMatch: Number(parsedData.jdMatch || 60),
      resumeHealth: Number(parsedData.resumeHealth || 65),
      keywordCoverage: Number(parsedData.keywordCoverage || 50),
      foundKeywords: Array.isArray(parsedData.foundKeywords) ? parsedData.foundKeywords : [],
      missingKeywords: Array.isArray(parsedData.missingKeywords) ? parsedData.missingKeywords : [],
      strengths: Array.isArray(parsedData.strengths) ? parsedData.strengths : [],
      weaknesses: Array.isArray(parsedData.weaknesses) ? parsedData.weaknesses : [],
      atsRisks: Array.isArray(parsedData.atsRisks) ? parsedData.atsRisks : [],
      suggestions: Array.isArray(parsedData.suggestions) ? parsedData.suggestions : [],
      sectionScores: {
        summary: Number(parsedData.sectionScores?.summary || 70),
        skills: Number(parsedData.sectionScores?.skills || 70),
        projects: Number(parsedData.sectionScores?.projects || 70),
        experience: Number(parsedData.sectionScores?.experience || 70),
        education: Number(parsedData.sectionScores?.education || 80),
        achievements: Number(parsedData.sectionScores?.achievements || 60),
      },
      rewrites: {
        summary: parsedData.rewrites?.summary || "",
        skills: Array.isArray(parsedData.rewrites?.skills) ? parsedData.rewrites.skills : [],
        experience: Array.isArray(parsedData.rewrites?.experience)
          ? parsedData.rewrites.experience
          : [],
        projects: Array.isArray(parsedData.rewrites?.projects) ? parsedData.rewrites.projects : [],
        achievements: Array.isArray(parsedData.rewrites?.achievements)
          ? parsedData.rewrites.achievements
          : [],
      },
    };
  } catch (error: any) {
    console.error("Gemini parse/API error:", error);
    throw new Error(`AI Analysis failed: ${error.message || error}`);
  }
}

/**
 * Optimizes a single bullet point into 3 alternatives.
 */
export async function optimizeBulletPoint(bulletPoint: string): Promise<string[]> {
  if (!isGeminiConfigured) {
    console.warn("[Gemini] API Key missing. Simulating bullet optimization.");
    return [
      `[ATS Metric Optimized] Accomplished target KPI goals by 18% utilizing optimized framework strategies.`,
      `[ATS Action Verb] Spearheaded execution of scalable architectures, reducing operational overhead by $12k.`,
      `[ATS Quantified] Configured automated pipelines that improved pipeline processing rates by 35%.`,
    ];
  }

  const prompt = `
You are an expert resume writer. Take the following resume bullet point and rewrite it into 3 distinct, ATS-optimized alternatives.
For each alternative, make sure to:
1. Start with a strong action verb (e.g. Spearheaded, Engineered, Orchestrated, Quantified).
2. Include a measurable result / metric where possible.
3. Be clear, concise, and professional.

Return your response as a strictly valid JSON array of strings containing exactly 3 items. Do not wrap in markdown code blocks.

Example output:
["Optimized version 1", "Optimized version 2", "Optimized version 3"]

Bullet Point:
"${bulletPoint}"
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const array = JSON.parse(rawJson);
    if (Array.isArray(array) && array.length >= 3) {
      return array.slice(0, 3);
    }
    throw new Error("Invalid array returned by Gemini");
  } catch (error) {
    console.error("Bullet optimization error:", error);
    return [
      `Spearheaded development of features matching bullet point, yielding a 15% increase in efficiency.`,
      `Engineered critical platform modules, resulting in a 25% decrease in load times.`,
      `Orchestrated cross-functional releases of systems, automating tasks and saving 10 hours weekly.`,
    ];
  }
}

/**
 * Returns static mock analysis for offline/development use.
 */
function simulateAnalysis(resumeText: string, jdText: string): AnalysisResponse {
  // Simple heuristic based on word length to give some variety
  const totalLength = resumeText.length + jdText.length;
  const scoreBase = 60 + (totalLength % 25);
  const jdMatchBase = 50 + (totalLength % 35);
  const healthBase = 70 + (totalLength % 15);

  return {
    atsScore: scoreBase,
    jdMatch: jdMatchBase,
    resumeHealth: healthBase,
    keywordCoverage: 60,
    foundKeywords: ["React", "TypeScript", "Vite", "REST APIs", "Tailwind CSS", "Git"],
    missingKeywords: [
      "CI/CD pipelines",
      "AWS services",
      "Unit Testing",
      "OAuth2",
      "Microservices",
      "Docker",
    ],
    strengths: [
      "Excellent technical stack alignment with React, TypeScript and modern CSS frameworks.",
      "Clear formatting and readable design layout structure.",
      "Good use of modern front-end engineering libraries and concepts.",
    ],
    weaknesses: [
      "Lack of quantified achievements (e.g. percentages, rupee amounts saved, hours saved).",
      "Missing DevOps keywords such as deployment configurations, Docker, or cloud platforms.",
      "Work history bullets lack strong initial action verbs in several sections.",
    ],
    atsRisks: [
      "Tables or multi-column layouts detected — some parsers may misalign reading flow.",
      "No direct contact section or postal address found — some older engines filter these.",
      "PDF uses non-standard custom icons for bullet points which can parse as random symbols.",
    ],
    suggestions: [
      "Add metrics to your experience bullets, for example: 'Reduced bundle size by 30% using tree-shaking'.",
      "Include key missing backend concepts like 'REST APIs integration' and 'JWT authentication'.",
      "Rewrite weak summary statement to explicitly list career targets and years of expertise.",
    ],
    sectionScores: {
      summary: 65,
      skills: 85,
      projects: 70,
      experience: 60,
      education: 90,
      achievements: 50,
    },
    rewrites: {
      summary:
        "Results-driven Software Engineer with expertise in building scalable React web applications. Proven track record of optimizing client performance, implementing Type-safe pipelines, and deploying robust user interfaces. Committed to quality code and agile development values.",
      skills: [
        "Core Tech: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query",
        "Systems: Supabase DB, RLS configuration, Cloudinary integration, REST API Architecture",
      ],
      experience: [
        "Spearheaded redesign of ATS analytics dashboard, improving user session durations by 22%.",
        "Engineered secure auth patterns using Supabase JWT tokens, reducing API breach vectors by 40%.",
      ],
      projects: [
        "Developed Resume optimization tool utilizing Gemini API, parsing over 1,500 resumes with a 98% parsing accuracy rate.",
        "Created custom component design system in Tailwind, decreasing project-wide CSS bloat by 35%.",
      ],
      achievements: [
        "Recipient of Engineering Excellence Award for outstanding UI performance optimizations.",
        "Graduated with honors in Computer Science, ranking in the top 5% of the class.",
      ],
    },
  };
}
