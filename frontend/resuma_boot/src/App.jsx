import React, { useState, useEffect } from "react";
import axios from "axios";
import { marked } from "marked";
// import html2pdf from "html2pdf.js"; // If using in browser, include via script tag

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load existing feedbacks from DB
  useEffect(() => {
    axios.get("http://localhost:8000/feedbacks/")
      .then(res => setFeedbackList(res.data))
      .catch(err => console.error("Failed to fetch feedbacks", err));
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
    window.html2pdf().from(element).set({
      margin: 0.5,
      filename: filename || "document.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    }).save();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) return alert("Please upload a resume PDF file");

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_description", jobDescription);

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/analyze/", formData);
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Resume & Cover Letter Analyzer</h1>

      {/* Upload Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white p-6 rounded-xl shadow-lg space-y-4"
      >
        <div>
          <label className="block mb-1 font-semibold">Upload Resume (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Job Description (optional)</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 h-28"
            placeholder="Paste job description here..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>

      {/* Feedback Results */}
      {feedbackList.length > 0 && (
        <div className="w-full max-w-6xl mt-10 space-y-10">
          {feedbackList.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-4 text-center text-blue-600">
                Results for: {item.fileName}
              </h2>

              {/* Resume Feedback */}
              <div>
                <h3 className="text-md font-semibold mb-2">📝 Resume Feedback</h3>
                <div
                  className="prose max-w-none overflow-y-auto max-h-[400px] p-3 border border-gray-200 rounded"
                  dangerouslySetInnerHTML={{ __html: marked(item.feedback || "") }}
                />
              </div>

              {/* Optimized Resume */}
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2">✅ ATS-Optimized Resume</h3>
                <div
                  id={`optimized-${index}`}
                  className="prose max-w-none overflow-y-auto max-h-[400px] p-3 border border-gray-200 rounded bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: marked(item.optimizedResume || "") }}
                />
              </div>

              {/* Cover Letter */}
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2">📩 Suggested Cover Letter</h3>
                <div
                  id={`cover-${index}`}
                  className="prose max-w-none overflow-y-auto max-h-[400px] p-3 border border-gray-200 rounded bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: marked(item.coverLetter || "") }}
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap justify-end gap-4">
                <button
                  onClick={() => handleCopy(item.optimizedResume)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  📋 Copy Resume
                </button>
                <button
                  onClick={() => handleCopy(item.coverLetter)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  📋 Copy Cover Letter
                </button>
                <button
                  onClick={() => handleDownload(`optimized-${index}`, "optimized_resume.pdf")}
                  className="text-sm text-green-600 hover:underline"
                >
                  ⬇️ Download Resume
                </button>
                <button
                  onClick={() => handleDownload(`cover-${index}`, "cover_letter.pdf")}
                  className="text-sm text-green-600 hover:underline"
                >
                  ⬇️ Download Cover Letter
                </button>
                <button
                  onClick={() => handleClear(index)}
                  className="text-sm text-red-600 hover:underline"
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
