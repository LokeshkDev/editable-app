import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BsDownload, BsPencilSquare, BsTrash } from "react-icons/bs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../assets/varahi-logo.png";

export default function SavedQuotations() {
  const [list, setList] = useState([]);

  useEffect(() => {
    axios.get("https://catering-backend-yeub.onrender.com/api/quotations").then((res) => setList(res.data));
  }, []);

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

  const deleteQuotation = async (name) => {
    if (!confirm("Delete this quotation?")) return;
    await axios.delete(`https://catering-backend-yeub.onrender.com/api/quotations/${name}`);
    setList(list.filter((q) => q.name !== name));
  };

  const downloadPdf = async (q) => {
    try {
      const dataUri = await generatePdfFromContents(q.contents);
      const a = document.createElement("a");
      a.href = dataUri;
      a.download = `${q.name}.pdf`;
      a.click();
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF");
    }
  };

  const generatePdfFromContents = async (contentsArray) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const topMargin = 55;

    // Load Logo First
    const logoBase64 = await loadLogoBase64();

    for (let i = 0; i < contentsArray.length; i++) {
      const wrapper = document.createElement("div");
      wrapper.style.width = "800px";
      wrapper.style.padding = "20px";
      wrapper.style.background = "white";
      wrapper.style.fontSize = "22px";
      wrapper.style.lineHeight = "1.5";
      wrapper.style.position = "fixed";
      wrapper.style.left = "-9999px";
      wrapper.innerHTML = contentsArray[i];
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, { scale: 1.6, useCORS: true });
      const img = canvas.toDataURL("image/jpeg", 0.9);
      document.body.removeChild(wrapper);

      // Header Background
      pdf.setFillColor(150, 0, 0);
      pdf.rect(0, 0, pdfWidth, 45, "F");

      // LOGO (NOW WORKING + LOADED)
      if (logoBase64) {
        pdf.addImage(logoBase64, "PNG", 10, 5, 30, 30);
      }

      // Header Text
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("SRI VARAHI CATERING", 50, 15);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text("No.15/5, Avalkara Street, Kosapet, Vellore - 1", 50, 22);
      pdf.text("90431 71992 / 97865 63854", 50, 28);
      pdf.text("srivarahicatering@gmail.com", 50, 34);

      // Body Content
      pdf.addImage(img, "JPEG", 10, topMargin, pdfWidth - 20, 0);

      if (i < contentsArray.length - 1) pdf.addPage();
    }

    return pdf.output("datauristring");
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Saved Quotations</h2>

      <div className="table-responsive shadow-sm">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Quotation Name</th>
              <th>Updated</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {list.map((q, i) => (
              <tr key={i}>
                <th>{i + 1}</th>
                <td className="fw-semibold">{q.name}</td>
                <td>{new Date(q.updated).toLocaleString()}</td>

                <td className="text-center">

                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    title="Download PDF"
                    onClick={() => downloadPdf(q)}
                  >
                    <BsDownload size={18} />
                  </button>

                  <Link
                    to={`/dashboard/create?edit=${q.name}`}
                    className="btn btn-outline-success btn-sm me-2"
                    title="Edit"
                  >
                    <BsPencilSquare size={18} />
                  </Link>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    title="Delete"
                    onClick={() => deleteQuotation(q.name)}
                  >
                    <BsTrash size={18} />
                  </button>

                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
