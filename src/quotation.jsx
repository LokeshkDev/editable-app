"use client";

import { useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Example logo (replace with your base64 or file path)
import logo from "./varahi-logo.png"; // place logo.png in /public or /src

export default function QuotationGenerator() {
  const editorRefs = useRef([]);
  const [pages, setPages] = useState([0]);
  const [contents, setContents] = useState([""]);

  const addPage = () => {
    setPages([...pages, pages.length]);
    setContents([...contents, ""]);
  };

  const exportPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    for (let i = 0; i < editorRefs.current.length; i++) {
      const input = editorRefs.current[i];
      if (!input) continue;

      const editorContent = input.querySelector(".ql-editor");
      if (!editorContent) continue;

      const canvas = await html2canvas(editorContent, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const contentHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // ✅ HEADER
      pdf.setFillColor(150, 0, 0); // dark red header background
      pdf.rect(0, 0, pdfWidth, 40, "F");

      if (logo) {
        pdf.addImage(logo, "PNG", 10, 5, 30, 30);
      }

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("SRI VARAHI CATERING", 50, 15);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("A-Z WEDDING PACKAGE", 50, 22);
      pdf.text("No.15/5, Avalkara Street, Kosapet, Vellore - 1", 50, 28);
      pdf.text("90431 71992, 97865 63854", 50, 34);
      pdf.text("srivarahicatering@gmail.com", 140, 34);

      // ✅ BODY CONTENT (below header)
      pdf.addImage(imgData, "PNG", 10, 50, pdfWidth - 20, contentHeight);

      if (i < editorRefs.current.length - 1) {
        pdf.addPage();
      }
    }

    pdf.save("quotation.pdf");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quotation Generator</h1>

      {pages.map((page, index) => (
        <div
          key={index}
          ref={(el) => (editorRefs.current[index] = el)}
          className="p-4 border rounded bg-white shadow-md mb-6"
        >
          <ReactQuill
            theme="snow"
            value={contents[index]}
            onChange={(val) => {
              const newContents = [...contents];
              newContents[index] = val;
              setContents(newContents);
            }}
            placeholder={`Type your content for Page ${index + 1}...`}
            className="min-h-[500px]"
          />
        </div>
      ))}

      <div className="flex gap-4">
        <button
          onClick={addPage}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
        >
          ➕ Add Page
        </button>

        <button
          onClick={exportPDF}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          📄 Export as PDF
        </button>
      </div>
    </div>
  );
}
