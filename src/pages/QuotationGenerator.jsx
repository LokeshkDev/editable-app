import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/varahi-logo.png";

export default function QuotationGenerator() {
  const [searchParams] = useSearchParams();
  const editName = searchParams.get("edit");

  const editorRefs = useRef([]);
  const [pages, setPages] = useState([0]);
  const [contents, setContents] = useState([""]);
  const [quotationName, setQuotationName] = useState("");

  // ------------------------------------------------------
  // 🎯 GUARANTEED WORKING LOGO BASE64 LOADER
  // ------------------------------------------------------
  const loadLogoBase64 = async () => {
    if (window.logoBase64) return window.logoBase64;

    const res = await fetch(logo);
    const blob = await res.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        window.logoBase64 = reader.result;
        resolve(window.logoBase64);
      };
      reader.readAsDataURL(blob);
    });
  };

  // ------------------------------------------------------
  // LOAD EXISTING QUOTATION
  // ------------------------------------------------------
  useEffect(() => {
    if (editName) {
      axios
        .get(`http://localhost:5000/api/quotations/${editName}`)
        .then((res) => {
          const data = res.data;
          setContents(data.contents);
          setPages(data.contents.map((_, i) => i));
          setQuotationName(data.name);
        })
        .catch((err) => console.log("Load Error:", err));
    }
  }, [editName]);

  // ------------------------------------------------------
  // GENERATE PDF (WITH LOGO + HEADER)
  // ------------------------------------------------------
  const generatePDF = async () => {
    const logoBase64 = await loadLogoBase64(); // 🔥 logo guaranteed

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const topMargin = 55;

    for (let i = 0; i < contents.length; i++) {
      // Create offscreen HTML for capturing
      const wrapper = document.createElement("div");
      wrapper.style.width = "800px";
      wrapper.style.padding = "20px";
      wrapper.style.background = "white";
      wrapper.style.fontSize = "22px";
      wrapper.style.lineHeight = "1.5";
      wrapper.style.position = "fixed";
      wrapper.style.left = "-9999px";
      wrapper.innerHTML = contents[i];
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, {
        scale: 1.6,
        useCORS: true,
      });

      const img = canvas.toDataURL("image/jpeg", 0.9);
      document.body.removeChild(wrapper);

      // HEADER BACKGROUND
      pdf.setFillColor(150, 0, 0);
      pdf.rect(0, 0, pdfWidth, 45, "F");

      // LOGO (Guaranteed to show)
      if (logoBase64) {
        pdf.addImage(logoBase64, "PNG", 10, 5, 30, 30);
      }

      // HEADER TEXT
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("SRI VARAHI CATERING", 50, 15);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text("No.15/5, Avalkara Street, Kosapet, Vellore - 1", 50, 22);
      pdf.text("90431 71992 / 97865 63854", 50, 28);
      pdf.text("srivarahicatering@gmail.com", 50, 34);

      // BODY CONTENT
      pdf.addImage(img, "JPEG", 10, topMargin, pdfWidth - 20, 0);

      if (i < contents.length - 1) pdf.addPage();
    }

    pdf.save(`${quotationName || "quotation"}.pdf`);
  };

  // ------------------------------------------------------
  // SAVE TO MONGODB (ONLY CONTENTS)
  // ------------------------------------------------------
  const saveQuotation = async () => {
    if (!quotationName.trim()) {
      alert("Please enter a quotation name");
      return;
    }

    const payload = { name: quotationName, contents };

    try {
      await axios.post("http://localhost:5000/api/quotations", payload);
      alert("Quotation Saved Successfully!");
      window.location.href = "/dashboard/saved";
    } catch (err) {
      console.error(err);
      alert("Save Failed");
    }
  };

  // ------------------------------------------------------
  // ADD NEW PAGE
  // ------------------------------------------------------
  const addPage = () => {
    setPages([...pages, pages.length]);
    setContents([...contents, ""]);
  };

  // ------------------------------------------------------
  // DELETE PAGE
  // ------------------------------------------------------
  const deletePage = (index) => {
    if (pages.length === 1) {
      alert("At least one page is required.");
      return;
    }

    setPages(pages.filter((_, i) => i !== index));
    setContents(contents.filter((_, i) => i !== index));
    editorRefs.current.splice(index, 1);
  };

  // ------------------------------------------------------
  // UI
  // ------------------------------------------------------
  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">
        {editName ? "Edit Quotation" : "Create New Quotation"}
      </h2>

      {/* QUOTATION NAME */}
      <input
        className="form-control mb-4"
        value={quotationName}
        onChange={(e) => setQuotationName(e.target.value)}
        placeholder="Enter Quotation Name"
      />

      {/* PAGES */}
      {pages.map((pg, index) => (
        <div key={index} className="card mb-4 shadow-sm">
          <div className="card-header d-flex justify-content-between">
            <strong>Page {index + 1}</strong>
            <button className="btn btn-danger btn-sm" onClick={() => deletePage(index)}>
              Delete
            </button>
          </div>

          <div className="card-body">
            <div ref={(el) => (editorRefs.current[index] = el)}>
              <ReactQuill
                theme="snow"
                value={contents[index]}
                onChange={(val) => {
                  const temp = [...contents];
                  temp[index] = val;
                  setContents(temp);
                }}
                style={{ minHeight: "350px", fontSize: "22px" }}
              />
            </div>
          </div>
        </div>
      ))}

      {/* ACTION BUTTONS */}
      <div className="d-flex gap-3 mt-3">
        <button className="btn btn-success" onClick={addPage}>
          ➕ Add Page
        </button>

        <button className="btn btn-primary" onClick={generatePDF}>
          📄 Download PDF
        </button>

        <button className="btn btn-danger" onClick={saveQuotation}>
          💾 Save Quotation
        </button>
      </div>
    </div>
  );
}
