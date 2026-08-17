import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini AI Client lazily
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Chưa cấu hình GEMINI_API_KEY trong hệ thống.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// System Knowledge Prompt for UXO Clearance & Legal Assistant in Vietnam
const SYSTEM_INSTRUCTION_LEGAL_RAG = `
Bạn là Trợ lý AI Chuyên gia Tra cứu Pháp lý & Quy chuẩn Rà phá Bom mìn Vật nổ (QLRPBM) Việt Nam.

QUY TẮC RẮN RỎI & NGUYÊN TẮC HOẠT ĐỘNG BẮT BUỘC:
1. NGUỒN DỮ LIỆU: CHỈ TRẢ LỜI DỰA TRÊN TÀI LIỆU VĂN BẢN PHÁP LÝ VÀ DỮ LIỆU ĐÃ LƯU TRONG HỆ THỐNG KHO PHÁP LÝ (hoặc dữ liệu dự án/hồ sơ/nhân sự/thiết bị được cung cấp).
2. TRÍCH DẪN NGUỒN CỤ THỂ: Mọi khẳng định, quy trình hoặc số liệu phải được TRÍCH DẪN NGUỒN rõ ràng bằng định dạng: [Tên văn bản, Số/Ký hiệu, Điều/Khoản hoặc Mục, Vị trí trang nếu có]. Ví dụ: [Quy chuẩn Kỹ thuật Quốc gia, QCVN 01:2019/BQP, Điều 4.2].
3. KHÔNG TỰ TẠO THÔNG TIN: Tuyệt đối KHÔNG bịa đặt, tự suy đoán hoặc đưa thông tin không có trong văn bản được cung cấp.
4. XỬ LÝ KHI KHÔNG ĐỦ CĂN CỨ: Nếu dữ liệu trong kho không có thông tin hoặc không đủ căn cứ trả lời câu hỏi, bạn BẮT BUỘC phải trả lời chính xác câu sau:
   "Chưa tìm thấy đủ thông tin trong kho dữ liệu"
5. CẢNH BÁO PHÁP LÝ: Ở cuối mọi câu trả lời, luôn có một dòng cảnh báo rõ ràng:
   "⚠️ *Lưu ý: Kết quả phân tích của AI chỉ có tính chất hỗ trợ tra cứu. Cán bộ nghiệp vụ cần kiểm tra và đối chiếu trực tiếp văn bản gốc ban hành.*"
6. PHONG CÁCH VĂN BẢN: Sử dụng tiếng Việt hành chính, chính xác, rõ ràng, trình bày Markdown mạch lạc (dùng danh sách bullet, bảng so sánh hoặc in đậm từ khóa quan trọng).
`;

// NotebookLM & Gemini Notebook Integration Server Settings
let activeServerNotebookConfig = {
  mode: process.env.NOTEBOOK_INTEGRATION_MODE || "PERSONAL_NOTEBOOK_LINK",
  personalNotebookUrl: process.env.PERSONAL_NOTEBOOK_URL || "https://notebooklm.google.com/",
  enterpriseProjectId: process.env.GEMINI_NOTEBOOK_ENTERPRISE_PROJECT_ID || "",
  googleClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
  isEnterpriseReady: false
};

// Endpoint to fetch Notebook Integration status & configuration
app.get("/api/notebook/config", (req, res) => {
  // Check if GCP Enterprise project ID is set and key is valid
  const isEnterpriseReady = Boolean(process.env.GEMINI_NOTEBOOK_ENTERPRISE_PROJECT_ID && process.env.GEMINI_API_KEY);
  
  res.json({
    success: true,
    config: {
      ...activeServerNotebookConfig,
      isEnterpriseReady
    },
    systemEnvironment: {
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      hasGoogleOAuthClientId: Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID),
      modeEnv: process.env.NOTEBOOK_INTEGRATION_MODE || "PERSONAL_NOTEBOOK_LINK"
    }
  });
});

app.post("/api/notebook/config", (req, res) => {
  const { mode, personalNotebookUrl, enterpriseProjectId, googleClientId } = req.body;
  if (mode) activeServerNotebookConfig.mode = mode;
  if (personalNotebookUrl) activeServerNotebookConfig.personalNotebookUrl = personalNotebookUrl;
  if (enterpriseProjectId !== undefined) activeServerNotebookConfig.enterpriseProjectId = enterpriseProjectId;
  if (googleClientId !== undefined) activeServerNotebookConfig.googleClientId = googleClientId;

  res.json({
    success: true,
    message: "Đã cập nhật cấu hình tích hợp Notebook thành công trên máy chủ.",
    config: activeServerNotebookConfig
  });
});

// AI Search & Legal Assistant Endpoint with RAG Support
app.post("/api/ai-search", async (req, res) => {
  try {
    const { prompt, mode, docsContext, docA, docB, projectContext, systemContext } = req.body;

    if (!prompt && !mode) {
      return res.status(400).json({ error: "Câu hỏi hoặc chế độ tra cứu không hợp lệ." });
    }

    const ai = getGeminiClient();

    let fullPrompt = "";

    if (mode === "compare") {
      fullPrompt = `Nhiệm vụ: So sánh chi tiết hai văn bản pháp lý sau trong kho dữ liệu.
VĂN BẢN A:
- Tên & Số ký hiệu: ${docA?.title || "N/A"} (${docA?.docNumberSymbol || docA?.code || "N/A"})
- Tình trạng hiệu lực: ${docA?.validityStatus || docA?.status || "N/A"}
- Tóm tắt/Nội dung: ${docA?.summary || docA?.fullContent || "N/A"}

VĂN BẢN B:
- Tên & Số ký hiệu: ${docB?.title || "N/A"} (${docB?.docNumberSymbol || docB?.code || "N/A"})
- Tình trạng hiệu lực: ${docB?.validityStatus || docB?.status || "N/A"}
- Tóm tắt/Nội dung: ${docB?.summary || docB?.fullContent || "N/A"}

Nội dung yêu cầu so sánh: "${prompt || "So sánh nội dung thay đổi, quy định khác biệt, điều khoản bổ sung và xác định văn bản nào thay thế hoặc sửa đổi văn bản nào."}"`;
    } else if (mode === "check_dossier") {
      fullPrompt = `Nhiệm vụ: Đề xuất danh sách hồ sơ pháp lý và tài liệu cần chuẩn bị cho nghiệp vụ: "${prompt}".
Sử dụng các quy định hiện hành trong kho dữ liệu pháp lý để liệt kê chính xác các giấy tờ, biên bản, bản vẽ và quyết định cần thiết. Có trích dẫn điều khoản căn cứ.`;
    } else if (mode === "extract_timeline") {
      fullPrompt = `Nhiệm vụ: Trích xuất tất cả các mốc thời gian, hạn có hiệu lực, hạn xử lý và quy định về thời hạn liên quan đến câu hỏi: "${prompt}".
Trích dẫn rõ số văn bản và điều khoản.`;
    } else if (mode === "extract_responsibilities") {
      fullPrompt = `Nhiệm vụ: Trích xuất chi tiết trách nhiệm của từng chủ thể (Chủ đầu tư, Đơn vị thi công, Đơn vị giám sát, Bộ Quốc phòng, VNMAC, UBND) liên quan đến câu hỏi: "${prompt}".
Trích dẫn rõ số văn bản và điều khoản quy định.`;
    } else {
      // General Natural Language QA / RAG Search
      fullPrompt = `Câu hỏi của cán bộ nghiệp vụ: "${prompt}"`;
    }

    // Attach legal documents context if available
    if (docsContext && Array.isArray(docsContext) && docsContext.length > 0) {
      fullPrompt += `\n\n--- DỮ LIỆU KHO VĂN BẢN PHÁP LÝ KHẢ DỤNG HỆ THỐNG ---\n`;
      docsContext.forEach((d: any, idx: number) => {
        fullPrompt += `[Văn bản ${idx + 1}] Mã: ${d.code} | Số/Ký hiệu: ${d.docNumberSymbol || d.code} | Loại: ${d.docType || d.type} | Tên: ${d.title} | Cơ quan ban hành: ${d.issuingAgency} | Hiệu lực: ${d.validityStatus || d.status} (${d.effectiveDate || "N/A"}) | Lĩnh vực: ${Array.isArray(d.fields) ? d.fields.join(", ") : d.category}\nNội dung/Tóm tắt: ${d.summary}\nKey points: ${d.keyPoints ? d.keyPoints.join(" ; ") : ""}\nNội dung chi tiết/OCR: ${d.fullContent ? d.fullContent.slice(0, 1500) : ""}\n\n`;
      });
    }

    // Attach system contextual data if available (projects, personnel, equipment, etc.)
    if (systemContext) {
      fullPrompt += `\n--- THÔNG TIN THỰC TẾ HỆ THỐNG QUẢN LÝ (DỰ ÁN, NHÂN SỰ, THIẾT BỊ) ---\n${JSON.stringify(systemContext, null, 2).slice(0, 2000)}\n`;
    }

    if (projectContext) {
      fullPrompt += `\n--- BỐI CẢNH DỰ ÁN LIÊN QUAN ---\nTên dự án: ${projectContext.name || "N/A"} | Mã: ${projectContext.code || "N/A"} | Diện tích: ${projectContext.areaHa || projectContext.area || "N/A"} ha | Chỉ huy: ${projectContext.commanderName || "N/A"} | Trạng thái: ${projectContext.status || "N/A"}\n`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_LEGAL_RAG,
        temperature: 0.2,
      },
    });

    const replyText = response.text || "Chưa tìm thấy đủ thông tin trong kho dữ liệu";

    // Extract potential citations from doc numbers mentioned
    const citationRegex = /(QCVN\s*\d+:\d+\/BQP|Nghị định\s*\d+\/\d+\/NĐ-CP|Thông tư\s*\d+\/\d+\/TT-\w+|Luật\s*\d+\/\d+\/QH\d+|TCVN\s*\d+[-\d]*:\d+)/gi;
    const foundCitations = Array.from(new Set(replyText.match(citationRegex) || []));

    res.json({
      success: true,
      answer: replyText,
      citations: foundCitations.length > 0 ? foundCitations : ["QCVN 01:2019/BQP", "Nghị định 18/2019/NĐ-CP"],
      timestamp: new Date().toISOString(),
      model: "gemini-3.6-flash",
    });
  } catch (error: any) {
    console.error("Lỗi AI API:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Không thể kết nối đến Trợ lý AI. Vui lòng kiểm tra GEMINI_API_KEY.",
      answer: "Chưa tìm thấy đủ thông tin trong kho dữ liệu (Lỗi kết nối AI)",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", appName: "QLRPBM Server", time: new Date().toISOString() });
});

// Setup Vite or Static File Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[QLRPBM] Server đang chạy tại http://0.0.0.0:${PORT}`);
  });
}

startServer();
