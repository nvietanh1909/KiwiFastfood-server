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
        
        // Sử dụng chat completions API mới thay vì mock response
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
        
        // Sử dụng chat completions API mới
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system", 
                    content: "Bạn là chuyên gia tư vấn thực đơn cho Kiwi Fastfood. Dựa trên sở thích của khách hàng, hãy đề xuất 3 món ăn phù hợp nhất từ thực đơn. Thực đơn có burger, pizza, món tráng miệng và đồ uống. Đề xuất nên có tên món, mô tả ngắn và giá. Trả lời bằng định dạng danh sách và tiếng Việt."
                },
                {
                    role: "user", 
                    content: `Sở thích của tôi: ${preferences}`
                }
            ],
            max_tokens: 200,
            temperature: 0.7,
        });
        
        const recommendations = response.data.choices[0].message.content.trim();
        
        res.json({
            success: true,
            recommendations: recommendations
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
        
        // Sử dụng chat completions API mới
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system", 
                    content: "Bạn là chuyên gia ẩm thực viết mô tả hấp dẫn và lôi cuốn cho thực đơn nhà hàng. Mô tả nên ngắn gọn, sử dụng từ ngữ gợi cảm giác ngon miệng và làm người đọc muốn thử món ăn ngay lập tức. Trả lời bằng tiếng Việt, không quá 50 từ."
                },
                {
                    role: "user", 
                    content: `Viết mô tả hấp dẫn cho món "${foodName}" ${ingredients ? `với các nguyên liệu: ${ingredients}` : ''} cho thực đơn của nhà hàng Kiwi Fastfood.`
                }
            ],
            max_tokens: 100,
            temperature: 0.8,
        });
        
        const description = response.data.choices[0].message.content.trim();
        
        res.json({
            success: true,
            description: description
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