import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "clean"]
  ]
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "check",
  "align",
  "blockquote",
  "code-block",
  "link"
];

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write detailed task specifications, formatted instructions, or notes...",
  minHeight = "220px"
}) {
  const [readOnlyMode, setReadOnlyMode] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all flex flex-col">
      {/* Editor Header Bar */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Task Description
          </span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            ReactQuill (Quill.js)
          </span>
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setReadOnlyMode(false)}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              !readOnlyMode ? "bg-indigo-600 text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setReadOnlyMode(true)}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              readOnlyMode ? "bg-indigo-600 text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Quill Editor Component */}
      <div className="rich-text-quill-wrapper flex-1">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          readOnly={readOnlyMode}
          placeholder={placeholder}
          modules={readOnlyMode ? { toolbar: false } : modules}
          formats={formats}
          style={{ minHeight }}
        />
      </div>

      {/* Custom Quill CSS tweaks to match Tailwind theme */}
      <style>{`
        .rich-text-quill-wrapper .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background-color: #f8fafc !important;
          border-top-left-radius: 0 !important;
          border-top-right-radius: 0 !important;
          padding: 8px 12px !important;
        }
        .rich-text-quill-wrapper .ql-container.ql-snow {
          border: none !important;
          font-family: var(--font-sans, inherit) !important;
          font-size: 0.875rem !important;
          color: #1e293b !important;
        }
        .rich-text-quill-wrapper .ql-editor {
          min-height: ${minHeight} !important;
          max-height: 380px !important;
          padding: 16px !important;
          line-height: 1.6 !important;
        }
        .rich-text-quill-wrapper .ql-editor.ql-blank::before {
          color: #94a3b8 !important;
          font-style: normal !important;
        }
        .rich-text-quill-wrapper .ql-snow .ql-picker-label {
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  );
}
