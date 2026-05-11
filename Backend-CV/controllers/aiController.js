import axios from 'axios';


const summaryGenerate = async(req, res) => {
            try {
                    const {skills, experience, education, certificates,summary} = req.body;
            // Construct the prompt for the OpenAI API
                const prompt = ` Act as an expert resume writer and ATS career assistant.
                    Generate a professional resume summary based on the following candidate data.
            Resume Data:
            old Summary: ${summary ? summary : "Not Provided"}  
            Skills:
            ${skills && skills.length > 0 ? skills.join(", ") : "Not Provided"}
            Experience:
            ${experience && experience.length > 0
            ? experience.map((exp) => `
            Title: ${exp.title || ""}
            Company: ${exp.company || ""}
            Start Date: ${exp.startDate || ""}
            End Date: ${exp.endDate || ""}
            Description: ${exp.description || ""}`).join("\n") : "Not Provided"}
            Education:
            ${education && education.length > 0
            ? education.map((edu) => `
            Degree: ${edu.degree || ""}
            Institution: ${edu.institution || ""}
            Start Date: ${edu.startDate || ""}
            End Date: ${edu.endDate || ""}
            GPA/Description: ${edu.description || ""}
            `).join("\n")
            : "Not Provided"}
            Certificates: 
            ${certificates ? certificates : "Not Provided"}
            Instructions:
                Generate a clear, concise, and professional resume summary based only on the provided input data.
                Do not include unnecessary explanations or extra information outside the given data.
                Focus only on relevant old summary, skills, education, experience, and achievements provided in the input.
                If some fields are missing (e.g., experience, certificates), ignore them naturally without mentioning their absence.
                Do not repeat the input data as-is; instead, convert it into a well-written professional summary.
                Maintain a confident, modern, and ATS-friendly tone suitable for job applications.
                Highlight key technical skills and roles relevant to the target job positions.
                Keep the summary between 500-600 characters (or as specified).
                Do not use bullet points, headings, or formatting—only a single paragraph.
                Ensure smooth readability with natural language flow.
                Output only the final summary text without any additional comments or labels.`;

                const response= await axios.post("https://openrouter.ai/api/v1/chat/completions",
                    {
                        model: "deepseek/deepseek-chat",
                        messages: [{ role: "user", content: prompt }],
                    },
                    {
                        headers: {
                        Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        },
                    });
                res.status(200).json({success:true, summary: response.data.choices[0].message.content, message: "AI Summary Generated" });
            } catch (error) {
                res.status(500).json({success:false, message: "Error calling OpenAI API:" + error.message});
            }
}


const workDescriptionGenerate = async(req, res) => {
    try {
        const {experience} = req.body;
        // Construct the prompt for the OpenAI API
        const prompt = ` Act as an expert resume writer and ATS career assistant.
Generate a professional work description based on the following candidate data.
Experience:
${experience && experience.length > 0
  ? experience.map((exp) => `
  Title: ${exp.title || ""}
  Company: ${exp.company || ""}
  Start Date: ${exp.startDate || ""}
  End Date: ${exp.endDate || ""}
  Description: ${exp.description || ""}`).join("\n")
  : "Not Provided"}

Instructions:
- Generate a clear, concise, and professional work description based only on the provided input data.
- Convert input data into a well-written professional description — do not repeat it as-is.
- If experience is missing or empty, write a general professional summary naturally.
- Focus on relevant experience, roles, and technical skills from the input.
- Maintain a confident, modern, and ATS-friendly tone suitable for job applications.
- Keep the description between 20-250 characters — single paragraph only.
- No bullet points, headings, or formatting — only plain flowing text.
- Output only the final description text — no labels, comments, or extra explanation.
`;
        const response= await axios.post("https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-chat",
                messages: [{ role: "user", content: prompt }],
            },
            {
                headers: {
                Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
                "Content-Type": "application/json",
                },
            });
        res.status(200).json({success:true, description: response.data.choices[0].message.content, message: "AI Work Desc Generated" });
    } catch (error) {
        res.status(500).json({success:false, message: "Error calling OpenAI API:" + error.message});
    }
}

const ATSScore=async(req,res)=>{
    console.log("ATS Score checker backend")
    try {
        const {resumeData}=req.body;

        const prompt = `You are a professional ATS (Applicant Tracking System) analyzer and resume expert.
Analyze the following resume data and calculate an ATS score out of 100.

Resume Data:
- Full Name: ${resumeData.fullName || ""}
- Email: ${resumeData.email || ""}
- Phone: ${resumeData.phone || ""}
- Location: ${resumeData.location || ""}
- LinkedIn: ${resumeData.linkedin || ""}
- Summary: ${resumeData.summary || ""}
- Skills: ${resumeData.skills?.length ? resumeData.skills.join(", ") : "Not Provided"}
- Languages: ${resumeData.languages?.length ? resumeData.languages.join(", ") : "Not Provided"}
- Experience: ${resumeData.experience?.length
    ? resumeData.experience.map(exp =>
        `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate})${exp.description ? ": " + exp.description : ""}`
      ).join(" | ")
    : "Not Provided"}
- Education: ${resumeData.education?.length
    ? resumeData.education.map(edu =>
        `${edu.degree} from ${edu.institution} (${edu.startDate} - ${edu.endDate})${edu.description ? ", GPA: " + edu.description : ""}`
      ).join(" | ")
    : "Not Provided"}
- Certificates: ${resumeData.certificates || "Not Provided"}

Scoring Criteria (Total 100 points):
- Contact Info completeness (name, email, phone, location, linkedin): 15 points
- Professional Summary quality and keywords: 20 points
- Skills relevance and count: 20 points
- Work Experience relevance and detail: 25 points
- Education background: 10 points
- Certificates and achievements: 10 points

Instructions:
- Analyze the resume and calculate ATS score out of 100.
- Return ONLY a plain string response.
- Do NOT return JSON.
- Do NOT add explanation.
- Output format must be exactly:
Example:
Total Score: 85, [ ContactInfo: 13/15, Summary: 17/20, Skills: 18/20, Experience: 20/25, Education: 9/10, Certificates: 8/10 ]

- Replace numbers with actual calculated values.
- Keep same labels and same format.`.trim();

      const response= await axios.post("https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-chat",
                messages: [{ role: "user", content: prompt }],
            },
            {
                headers: {
                Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
                "Content-Type": "application/json",
                },
            });
            
            console.log(response.data.choices[0].message.content);
            res.status(200).json({success:true,message: response.data.choices[0].message.content});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message: "ATS call failed"});

        
    }
}


export {summaryGenerate, workDescriptionGenerate,ATSScore};