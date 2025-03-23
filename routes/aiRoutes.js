const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
const asyncHandler = require('express-async-handler');

// Configure OpenAI
const configuration = new Configuration ({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * @desc    Get AI chatbot response
 * @route   POST /api/ai/chat
 * @access  Public
 */
router.post('/chat', asyncHandler(async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }
        
        // Sử dụng mock response thay vì gọi OpenAI API
        const mockResponse = "Xin chào! Tôi là trợ lý AI của Kiwi Fastfood. Chúng tôi có nhiều món ăn phổ biến như Burger Gà Cay, Burger Bò Phô Mai, Pizza Hải Sản, Pizza Thịt Hỗn Hợp, và Khoai Tây Chiên. Bạn thích ăn món nào ngọt hay mặn, cay hay không cay? Tôi có thể giới thiệu chi tiết hơn dựa trên sở thích của bạn.";
        
        res.json({
            success: true,
            response: mockResponse
        });
        
        /* 
        // Nếu bạn muốn cập nhật để sử dụng API mới, hãy bỏ comment phần code này
        // và comment phần mock response ở trên
        
        // Sử dụng chat completions API mới thay vì completions API cũ
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system", 
                    content: "Bạn là trợ lý AI của Kiwi Fastfood, một nhà hàng đồ ăn nhanh. Hãy giúp khách hàng với thông tin về thực đơn, giá cả, cách đặt hàng, và các ưu đãi. Thực đơn gồm burger, pizza, món tráng miệng và đồ uống. Bạn nên tư vấn và gợi ý món ăn dựa trên sở thích của khách hàng. Trả lời bằng tiếng Việt, lịch sự và thân thiện."
                },
                {
                    role: "user", 
                    content: message
                }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });
        
        const aiResponse = response.data.choices[0].message.content.trim();
        
        res.json({
            success: true,
            response: aiResponse
        });
        */
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error processing your request'
        });
    }
}));

/**
 * @desc    Get menu recommendations based on preferences
 * @route   POST /api/ai/recommend
 * @access  Public
 */
router.post('/recommend', asyncHandler(async (req, res) => {
    try {
        const { preferences } = req.body;
        
        if (!preferences) {
            return res.status(400).json({
                success: false,
                error: 'Preferences are required'
            });
        }
        
        // Sử dụng mock response
        const mockRecommendations = `1. Burger Gà Cay - Burger với thịt gà được tẩm ướp cay thơm, kèm rau tươi và sốt đặc biệt. Giá: 75.000đ
2. Pizza Thịt Hỗn Hợp - Đế bánh giòn, phủ nhiều loại thịt và phô mai. Giá: 120.000đ
3. Khoai Tây Chiên Phô Mai - Khoai tây chiên giòn phủ lớp phô mai béo ngậy. Giá: 45.000đ`;
        
        res.json({
            success: true,
            recommendations: mockRecommendations
        });
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error processing your request'
        });
    }
}));

/**
 * @desc    Generate food description
 * @route   POST /api/ai/description
 * @access  Private (Admin only in production)
 */
router.post('/description', asyncHandler(async (req, res) => {
    try {
        const { foodName, ingredients } = req.body;
        
        if (!foodName) {
            return res.status(400).json({
                success: false,
                error: 'Food name is required'
            });
        }
        
        // Sử dụng mock response
        const mockDescription = `${foodName} - Món ăn tuyệt hảo với ${ingredients || 'các nguyên liệu tươi ngon'}, được chế biến tinh tế tạo nên hương vị đặc trưng khó quên. Thưởng thức ngay để cảm nhận sự khác biệt!`;
        
        res.json({
            success: true,
            description: mockDescription
        });
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error processing your request'
        });
    }
}));

module.exports = router; 