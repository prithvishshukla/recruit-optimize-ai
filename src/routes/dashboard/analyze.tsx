import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/db";
import { extractTextFromPdf } from "@/lib/resumeParser";
import { analyzeResume } from "@/lib/gemini";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Briefcase,
  AlertTriangle,
  Loader2,
  CheckCircle,
  X,
  FileCheck,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/analyze")({
  component: AnalyzePage,
});

function AnalyzePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState("");

  // Fetch subscription info
  const { data: subscription } = useQuery({
    queryKey: ["userSubscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return db.getUserSubscription(user.id);
    },
    enabled: !!user?.id,
  });

  // Fetch today's scans count (for daily limit checks)
  const { data: todayScansCount = 0 } = useQuery({
    queryKey: ["todayScansCount", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const reports = await db.getUserReports(user.id);
      const todayReports = reports.filter((r) => new Date(r.created_at) >= startOfDay);
      return todayReports.length;
    },
    enabled: !!user?.id,
  });

  const isLimitReached = subscription?.plan_type === "free" && todayScansCount >= 1;

  // File Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Invalid file format", { description: "Please upload a PDF file only." });
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File is too large", { description: "Maximum file size is 10 MB." });
      return;
    }
    setFile(selectedFile);
    toast.success("File added", { description: `${selectedFile.name} successfully staged.` });
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setFile(null);
  };

  // Submit / Analysis Workflow
  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Missing Resume", { description: "Please select or drop a PDF resume file." });
      return;
    }
    if (!jobTitle.trim()) {
      toast.error("Missing Job Title", { description: "Please enter a target Job Title." });
      return;
    }
    if (!jobDescription.trim() || jobDescription.length < 50) {
      toast.error("Invalid Job Description", {
        description: "Please enter a job description of at least 50 characters.",
      });
      return;
    }

    if (isLimitReached) {
      toast.error("Daily Scan Limit Exceeded", {
        description: "Free tier users are limited to 1 scan per day. Please upgrade to Premium.",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStatus("Uploading PDF resume safely...");

    try {
      let secureUrl = "https://res.cloudinary.com/demo/image/upload/sample.pdf";
      let publicId = "sample_pdf_placeholder";

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      // Only attempt Cloudinary upload if variables are configured
      if (
        cloudName &&
        uploadPreset &&
        !cloudName.includes("your-") &&
        !uploadPreset.includes("your-")
      ) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", uploadPreset);

          const cloudinaryRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: formData },
          );

          if (!cloudinaryRes.ok) {
            throw new Error(`Cloudinary responded with ${cloudinaryRes.status}`);
          }
          const cloudinaryData = await cloudinaryRes.json();
          secureUrl = cloudinaryData.secure_url;
          publicId = cloudinaryData.public_id;
        } catch (err) {
          console.error("Cloudinary upload failed, falling back to placeholder url:", err);
          toast.warning("Cloudinary configured incorrectly. Running audit with safe mocks.");
        }
      } else {
        console.warn("[Cloudinary] Credentials not configured. Using local sandbox fallback.");
      }

      // 2. Extract text from PDF
      setAnalysisStatus("Parsing and extracting text from PDF...");
      const extractedText = await extractTextFromPdf(file);

      // 3. Save Resume record to DB
      setAnalysisStatus("Storing resume index metadata...");
      const resumeRecord = await db.insertResume({
        user_id: user?.id || "",
        file_name: file.name,
        file_size: file.size,
        cloudinary_url: secureUrl,
        cloudinary_public_id: publicId,
        extracted_text: extractedText,
      });

      // 4. Run Gemini AI analysis
      setAnalysisStatus("Analyzing ATS scores with Gemini AI...");
      const aiResponse = await analyzeResume(extractedText, jobDescription);

      // 5. Save Analysis Report to DB
      setAnalysisStatus("Generating audit report metrics...");
      const reportRecord = await db.insertAnalysisReport({
        user_id: user?.id || "",
        resume_id: resumeRecord.id,
        job_title: jobTitle,
        job_description: jobDescription,
        ats_score: aiResponse.atsScore,
        jd_match: aiResponse.jdMatch,
        resume_health: aiResponse.resumeHealth,
        keyword_coverage: aiResponse.keywordCoverage,
        analysis_result: aiResponse,
      });

      // 6. Record version history
      await db.insertResumeVersion({
        resume_id: resumeRecord.id,
        user_id: user?.id || "",
        version_number: 1,
        ats_score: aiResponse.atsScore,
        jd_match: aiResponse.jdMatch,
        resume_health: aiResponse.resumeHealth,
        improvement_summary: "Initial baseline analysis report.",
      });

      // Log Activity
      await db.insertActivityLog({
        user_id: user?.id || "",
        action: "analyze_resume",
        details: `Analyzed resume for role: ${jobTitle} (ATS Score: ${aiResponse.atsScore})`,
      });

      toast.success("Analysis Complete", { description: "Resume successfully audited!" });
      queryClient.invalidateQueries({ queryKey: ["userReports"] });
      queryClient.invalidateQueries({ queryKey: ["todayScansCount"] });

      // Navigate to report
      navigate({ to: `/dashboard/report/${reportRecord.id}` });
    } catch (error: any) {
      console.error("Analysis Pipeline Failed:", error);
      toast.error("Analysis Pipeline Failed", { description: error.message || error });
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatus("");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          ATS Audit Engine
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your resume and paste the target job description to run a detailed ATS scan.
        </p>
      </div>

      {isLimitReached && (
        <div className="flex gap-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <strong className="text-foreground">Daily Scan Limit Reached</strong>
            <p className="mt-1 text-muted-foreground">
              Your free tier account permits 1 ATS scan daily. You have already completed your daily
              scan quota. Upgrade to unlock unlimited scans, bullet point optimization, and AI
              resume rewrites.
            </p>
            <div className="mt-3.5">
              <Link
                to="/price"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 px-4 text-xs font-semibold text-black transition"
              >
                Upgrade to Premium
              </Link>
            </div>
          </div>
        </div>
      )}

      {isAnalyzing ? (
        /* Progress Screen */
        <div className="rounded-3xl border border-border bg-card p-12 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#B8924A] mb-6" />
          <h2 className="font-display text-xl font-bold text-foreground">
            Performing Resume Audit
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">{analysisStatus}</p>
          <div className="mt-6 mx-auto max-w-md bg-secondary h-2 rounded-full overflow-hidden">
            <div className="bg-[#B8924A] h-full animate-[pulse_1.5s_infinite] w-[70%]" />
          </div>
        </div>
      ) : (
        /* Setup Form */
        <form onSubmit={handleStartAnalysis} className="space-y-6">
          {/* File Upload Box */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              1. Resume Upload
            </h2>

            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition ${
                  dragActive
                    ? "border-[#B8924A] bg-[#B8924A]/5"
                    : "border-border hover:border-border/80 bg-secondary/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLimitReached}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary border border-border text-muted-foreground mb-4">
                  <Upload size={22} />
                </div>
                <h3 className="text-sm font-bold text-foreground">Drag and drop resume PDF</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF format only. Maximum file size 10 MB.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20 text-green-600">
                    <FileCheck size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary/50 transition"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Job Details Box */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              2. Target Position Details
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Job Title
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={isLimitReached}
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-[#B8924A] focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Job Description
                </label>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {jobDescription.length} characters
                </span>
              </div>
              <textarea
                placeholder="Paste the full job description text here (minimum 50 characters)..."
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isLimitReached}
                className="w-full rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground focus:border-[#B8924A] focus:outline-none transition leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Action Footer */}
          <button
            type="submit"
            disabled={isLimitReached || !file || !jobTitle || !jobDescription}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#B8924A] text-black font-semibold hover:bg-[#B8924A]/90 disabled:bg-secondary disabled:text-muted-foreground/50 disabled:cursor-not-allowed transition duration-200 shadow-md active:scale-[0.99]"
          >
            Run ATS Resume Audit
          </button>
        </form>
      )}
    </div>
  );
}
