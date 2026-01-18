import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackResponse, SessionStats, ParentReport, DocumentExtractionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Bạn là MemoMaster AI, một người bạn đồng hành học tập kết hợp vai trò của **Chuyên gia Động lực**, **Nhà phân tích Chính xác**, **Huấn luyện viên Ghi nhớ** và **Công cụ Hiểu Giọng Nói**.
Nhiệm vụ của bạn là đánh giá độ chính xác, giữ cho trẻ hứng thú, cung cấp phương pháp học tập khoa học và xử lý giọng nói thông minh.
TẤT CẢ PHẢN HỒI PHẢI BẰNG TIẾNG VIỆT.
`;

const DOCUMENT_INTELLIGENCE_INSTRUCTION = `
Bạn là Công cụ Trí tuệ Tài liệu của MemoMaster. Vai trò của bạn là trích xuất, làm sạch và chuẩn bị nội dung văn bản từ các tệp PDF và Word được tải lên để trẻ em thực hành ghi nhớ.

QUY TRÌNH LÀM SẠCH VĂN BẢN:
1. Loại bỏ nhiễu: Loại bỏ số trang, tiêu đề đầu/cuối trang, hình mờ không liên quan.
2. Chuẩn hóa khoảng cách: Sửa lỗi xuống dòng giữa từ, đảm bảo đoạn văn liền mạch.
3. Bảo tồn cấu trúc: Giữ nguyên các đề mục, danh sách gạch đầu dòng.
4. Định dạng thân thiện với trẻ em: Làm sạch bố cục phức tạp thành văn bản đơn giản, dễ đọc.

ĐẦU RA:
Trả về JSON chứa văn bản đã trích xuất, siêu dữ liệu và đánh giá chất lượng. TẤT CẢ văn bản trích xuất phải là Tiếng Việt nếu tài liệu là Tiếng Việt.
`;

const ANALYTICS_INSTRUCTION = `
Bạn là Chuyên gia Phân tích của MemoMaster. Nhiệm vụ của bạn là tạo báo cáo rõ ràng, hữu ích cho phụ huynh để theo dõi tiến độ học tập của con.
TẤT CẢ ĐẦU RA PHẢI BẰNG TIẾNG VIỆT.
`;

export const extractDocumentText = async (fileBase64: string, mimeType: string): Promise<DocumentExtractionResult> => {
  const model = "gemini-2.5-flash";
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType
            }
          },
          { text: "Hãy trích xuất và làm sạch nội dung tài liệu này để trẻ em học thuộc lòng. Trả về định dạng JSON theo yêu cầu." }
        ]
      },
      config: {
        systemInstruction: DOCUMENT_INTELLIGENCE_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extracted_text: { type: Type.STRING },
            metadata: {
              type: Type.OBJECT,
              properties: {
                document_type: { type: Type.STRING },
                page_count: { type: Type.INTEGER },
                word_count: { type: Type.INTEGER },
                detected_language: { type: Type.STRING },
                has_images: { type: Type.BOOLEAN },
                has_tables: { type: Type.BOOLEAN },
                extraction_method: { type: Type.STRING }
              },
              required: ["document_type", "page_count", "word_count", "detected_language"]
            },
            quality_assessment: {
              type: Type.OBJECT,
              properties: {
                overall_score: { type: Type.INTEGER },
                confidence_level: { type: Type.STRING, enum: ["high", "medium", "low"] },
                issues_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["overall_score", "confidence_level"]
            },
            structure: {
              type: Type.OBJECT,
              properties: {
                headings: { type: Type.ARRAY, items: { type: Type.STRING } },
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      content: { type: Type.STRING },
                      word_count: { type: Type.INTEGER }
                    }
                  }
                }
              }
            }
          },
          required: ["extracted_text", "metadata", "quality_assessment"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DocumentExtractionResult;
    }
    throw new Error("Extraction failed: Empty result");
  } catch (e) {
    console.error("Document extraction error:", e);
    throw e;
  }
};

export const evaluateRecitation = async (
  referenceText: string,
  userAudioBase64: string | null,
  userText: string | null,
  stats: SessionStats
): Promise<FeedbackResponse> => {
  const model = "gemini-2.5-flash";
  const parts: any[] = [];
  const contextMsg = `CONTEXT: Attempt ${stats.attempts + 1}, Best ${stats.bestScore}`;
  parts.push({ text: contextMsg });

  if (userAudioBase64) {
    parts.push({ inlineData: { mimeType: "audio/wav", data: userAudioBase64 } });
  } else if (userText) {
    parts.push({ text: `User typed: "${userText}"` });
  }

  parts.push({ text: `Compare with: "${referenceText}"` });

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overall_score: { type: Type.INTEGER },
          grade_level: { type: Type.STRING },
          encouragement_message: { type: Type.STRING },
          accuracy_breakdown: {
            type: Type.OBJECT,
            properties: {
              similarity_score: { type: Type.INTEGER },
              key_concepts_score: { type: Type.INTEGER },
              structure_score: { type: Type.INTEGER }
            }
          },
          mismatches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                severity: { type: Type.STRING },
                description: { type: Type.STRING },
                original: { type: Type.STRING },
                student_said: { type: Type.STRING },
                impact: { type: Type.STRING },
                memory_aid: { type: Type.STRING }
              }
            }
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvement_areas: { type: Type.ARRAY, items: { type: Type.STRING } },
          transcription: { type: Type.STRING },
          achievements: {
              type: Type.ARRAY,
              items: {
                  type: Type.OBJECT,
                  properties: { title: { type: Type.STRING }, emoji: { type: Type.STRING }, description: { type: Type.STRING } }
              }
          },
          learning_tip: {
              type: Type.OBJECT,
              properties: {
                  technique_name: { type: Type.STRING },
                  why_it_helps: { type: Type.STRING },
                  how_to_do_it: { type: Type.STRING },
                  try_it_now: { type: Type.STRING },
                  expected_result: { type: Type.STRING }
              }
          },
          speech_analysis: {
              type: Type.OBJECT,
              properties: {
                  original_speech: { type: Type.STRING },
                  cleaned_speech: { type: Type.STRING },
                  detected_language: { type: Type.STRING },
                  confidence_score: { type: Type.NUMBER },
                  quality_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  processing_notes: { type: Type.STRING }
              }
          }
        },
        required: ["overall_score", "encouragement_message", "transcription"]
      }
    }
  });
  return JSON.parse(response.text) as FeedbackResponse;
};

export const generateParentReport = async (stats: SessionStats): Promise<ParentReport> => {
    const model = "gemini-2.5-flash";
    const durationMinutes = Math.round((Date.now() - stats.startTime) / 60000);
    const prompt = `Report stats: ${durationMinutes}m duration, ${stats.attempts} attempts, history: ${JSON.stringify(stats.history)}`;
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }] },
        config: { systemInstruction: ANALYTICS_INSTRUCTION, responseMimeType: "application/json" }
    });
    return JSON.parse(response.text) as ParentReport;
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
};

const pcmToWav = (base64PCM: string, sampleRate: number = 24000): string => {
  const binaryString = atob(base64PCM);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + len, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, len, true);
  const wavBuffer = new Uint8Array(wavHeader.byteLength + len);
  wavBuffer.set(new Uint8Array(wavHeader), 0);
  wavBuffer.set(bytes, wavHeader.byteLength);
  let binary = '';
  for (let i = 0; i < wavBuffer.byteLength; i++) binary += String.fromCharCode(wavBuffer[i]);
  return btoa(binary);
}

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: { responseModalities: ["AUDIO"] }
    });
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) return `data:audio/wav;base64,${pcmToWav(audioData)}`;
    return null;
  } catch (e) {
    return null;
  }
};