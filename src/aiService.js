import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateDatePlan = async (sessionData, apiKey) => {
  if (!apiKey) {
    return {
      title: "Một buổi tối bình yên",
      activity: "Cùng nhau nấu một bữa ăn đơn giản và xem một bộ phim lãng mạn.",
      reason: "Hãy nhập Gemini API Key để nhận được những gợi ý cá nhân hóa và sáng tạo hơn từ AI nhé!"
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const { mode, completedPrompts, stats } = sessionData;
    
    const prompt = `
      Bạn là một AI chuyên gia về tâm lý cặp đôi và lên kế hoạch hẹn hò (Date Planner).
      Dựa trên thông tin buổi chơi dưới đây, hãy gợi ý một kế hoạch hẹn hò chi tiết và sáng tạo cho cặp đôi.
      
      Thông tin buổi chơi:
      - Chế độ chơi: ${mode.label} (${mode.description})
      - Số câu hỏi đã hoàn thành: ${completedPrompts?.length || 0}
      - Thời gian chơi: ${stats.time} giây
      - Các chủ đề đã thảo luận: ${completedPrompts?.map(p => p.content).join(", ") || "N/A"}
      
      Yêu cầu gợi ý:
      1. Phù hợp với "tâm trạng" của buổi chơi (Ví dụ: Healing Path thì nhẹ nhàng, Spicy thì nồng cháy).
      2. Kế hoạch cụ thể (Thời gian, địa điểm, hoạt động).
      3. Giải thích tại sao hoạt động này lại giúp gắn kết họ hơn dựa trên những gì họ vừa thảo luận.
      4. Ngôn ngữ: Tiếng Việt, giọng văn lãng mạn, tinh tế và ấm áp.
      5. Định dạng: Trả về một đối tượng JSON với các trường: "title" (Tiêu đề buổi hẹn), "activity" (Hoạt động chính), "reason" (Lý do gắn kết).
      
      Chỉ trả về JSON, không kèm giải thích gì thêm.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Làm sạch chuỗi JSON nếu Gemini trả về kèm markdown
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    return {
      vibe: "Cần kết nối",
      title: "Một buổi tối bình yên",
      activity: "Cùng nhau nấu một bữa ăn đơn giản và xem một bộ phim lãng mạn.",
      itinerary: ["Chuẩn bị nguyên liệu", "Cùng nhau vào bếp", "Thưởng thức bữa tối", "Xem phim"],
      preparation: ["Nguyên liệu nấu ăn", "Một bộ phim yêu thích"],
      reason: "Có lỗi xảy ra khi kết nối với AI. Vui lòng kiểm tra lại API Key hoặc kết nối mạng.",
      special_challenge: "Hãy dành cho nhau một cái ôm thật lâu trước khi bắt đầu.",
      playlist_vibe: "Lofi Chill",
      conversation_starter: "Anh/Em cảm thấy thế nào về buổi chơi vừa rồi?"
    };
  }
};

export const generateAnswerHint = async (promptContent, apiKey) => {
  if (!apiKey) return "Vui lòng thiết lập API Key để dùng tính năng này.";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Bạn là một chuyên gia tâm lý và tư vấn tình cảm. 
      Cặp đôi đang chơi một trò chơi thấu hiểu và gặp câu hỏi này: "${promptContent}"
      
      Hãy gợi ý cho họ cách trả lời câu hỏi này một cách sâu sắc, chân thành và giúp gắn kết tình cảm hơn.
      Yêu cầu:
      1. Đưa ra 2-3 hướng tiếp cận khác nhau (ví dụ: chia sẻ kỷ niệm, nói về cảm xúc hiện tại, hoặc mong muốn tương lai).
      2. Gợi ý một vài từ khóa hoặc ý tưởng để họ dễ dàng mở lời.
      3. Giọng văn ấm áp, khích lệ và tinh tế.
      4. Ngôn ngữ: Tiếng Việt.
      5. Độ dài: Ngắn gọn, súc tích (khoảng 100-150 chữ).
      
      Chỉ trả về nội dung văn bản tư vấn, không cần chào hỏi hay kết luận.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API cho Answer Hint:", error);
    return "Có lỗi xảy ra khi kết nối với AI. Bạn hãy thử chia sẻ thật lòng những gì mình nghĩ nhé, đó luôn là cách tốt nhất!";
  }
};
