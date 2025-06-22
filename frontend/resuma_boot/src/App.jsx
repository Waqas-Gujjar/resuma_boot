  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import { marked } from "marked";
  import html2pdf from "html2pdf.js";

  function App() {
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      axios
        .get("http://0.0.0.0:8000/feedbacks/")
        .then((res) => setFeedbackList(res.data))
        .catch((err) => console.error("Failed to fetch feedbacks", err));
    }, []);

    const handleFileChange = (e) => {
      setResumeFile(e.target.files[0]);
    };

    const handleCopy = (text) => {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    };

    const handleClear = (index) => {
      const updated = [...feedbackList];
      updated.splice(index, 1);
      setFeedbackList(updated);
    };

    const handleDownload = (id, filename) => {
      const element = document.getElementById(id);
      if (!element) return;

      html2pdf()
        .from(element)
        .set({
          margin: 0.5,
          filename: filename || "document.pdf",
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .save();
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!resumeFile) return alert("Please upload a resume PDF file");

      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("job_description", jobDescription);

      setLoading(true);
      try {
        const response = await axios.post("http://0.0.0.0:8000/analyze/", formData);
        const newFeedback = {
          fileName: resumeFile.name,
          feedback: response.data.feedback,
          optimizedResume: response.data.optimized_resume,
          coverLetter: response.data.cover_letter,
        };
        setFeedbackList([newFeedback, ...feedbackList]);
        setResumeFile(null);
        setJobDescription("");
      } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong while analyzing the resume.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-white to-indigo-50 flex flex-col items-center px-6 py-12">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-10 drop-shadow-md">
          AI Resume & Cover Letter Analyzer
        </h1>

        {/* Upload Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-xl border border-indigo-200"
        >
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-indigo-600" htmlFor="resume-upload">
              Upload Resume (PDF)
            </label>
            <input
              id="resume-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full border border-indigo-300 rounded-lg px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-semibold text-indigo-600" htmlFor="job-description">
              Job Description (optional)
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full border border-indigo-300 rounded-lg px-4 py-3 resize-none h-32 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Paste job description here..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition ${
              loading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
            } shadow-lg`}
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>

        {/* Feedback Results */}
        {feedbackList.length > 0 && (
          <div className="w-full max-w-7xl mt-14 space-y-12">
            {feedbackList.map((item, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-2xl border border-indigo-100"
              >
                <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700 tracking-wide">
                  Results for: {item.fileName}
                </h2>

                {/* Resume Feedback */}
                <section className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-indigo-600">
                    📝 Resume Feedback
                  </h3>
                  <div
                    className="prose prose-indigo max-w-none overflow-y-auto max-h-96 p-4 border border-indigo-200 rounded-lg bg-indigo-50"
                    dangerouslySetInnerHTML={{ __html: marked(item.feedback || "") }}
                  />
                </section>

                {/* Optimized Resume */}
                <section className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-600">
                    ✅ ATS-Optimized Resume
                  </h3>
                  <div
                    id={`optimized-${index}`}
                    className="prose prose-green max-w-none overflow-y-auto max-h-96 p-4 border border-green-200 rounded-lg bg-green-50"
                    dangerouslySetInnerHTML={{ __html: marked(item.optimizedResume || "") }}
                  />
                </section>

                {/* Cover Letter */}
                <section className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-600">
                    📩 Suggested Cover Letter
                  </h3>
                  <div
                    id={`cover-${index}`}
                    className="prose prose-purple max-w-none overflow-y-auto max-h-96 p-4 border border-purple-200 rounded-lg bg-purple-50"
                    dangerouslySetInnerHTML={{ __html: marked(item.coverLetter || "") }}
                  />
                </section>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-end gap-5 mt-4">
                  <button
                    onClick={() => handleCopy(item.optimizedResume)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline transition"
                  >
                    📋 Copy Resume
                  </button>
                  <button
                    onClick={() => handleCopy(item.coverLetter)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline transition"
                  >
                    📋 Copy Cover Letter
                  </button>
                  <button
                    onClick={() => handleDownload(`optimized-${index}`, "optimized_resume.pdf")}
                    className="text-sm font-medium text-green-600 hover:text-green-800 underline transition"
                  >
                    ⬇️ Download Resume
                  </button>
                  <button
                    onClick={() => handleDownload(`cover-${index}`, "cover_letter.pdf")}
                    className="text-sm font-medium text-green-600 hover:text-green-800 underline transition"
                  >
                    ⬇️ Download Cover Letter
                  </button>
                  <button
                    onClick={() => handleClear(index)}
                    className="text-sm font-medium text-red-600 hover:text-red-800 underline transition"
                  >
                    ❌ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  export default App;
