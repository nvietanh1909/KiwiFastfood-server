const express = require('express');
const router = express.Router();
const axios = require('axios');
const asyncHandler = require('express-async-handler');
const https = require('https');
const Product = require('../models/Product');
const Category = require('../models/Category');
const NodeCache = require('node-cache');
const compression = require('compression');

// Initialize cache with 5 minutes TTL
const menuCache = new NodeCache({ stdTTL: 300 });

// Configure Grok API
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_API_KEY = process.env.GROK_API_KEY;

// Create axios instance with custom config
const grokClient = axios.create({
    baseURL: GROK_API_URL,
    headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false // Only use this in development
    })
});

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Helper function to get menu information with caching
async function getMenuInfo() {
    // Try to get from cache first
    const cachedMenu = menuCache.get('menuInfo');
    if (cachedMenu) {
        return cachedMenu;
    }

    // If not in cache, fetch from database
    const [products, categories] = await Promise.all([
        Product.find().populate('maLoai').lean(),
        Category.find().lean()
    ]);
    
    const menuByCategory = {};
    categories.forEach(category => {
        menuByCategory[category.tenLoai] = products
            .filter(product => product.maLoai._id.toString() === category._id.toString())
            .map(product => ({
                name: product.tenMon,
                price: formatCurrency(product.giaBan),
                description: product.noiDung,
                stock: product.soLuongTon
            }));
    });

    // Cache the result
    menuCache.set('menuInfo', menuByCategory);
    return menuByCategory;
}

// Helper function to format menu text for chat
function formatMenuTextForChat(menuInfo, message) {
    // Phân tích message để xác định loại thông tin cần thiết
    const lowerMessage = message.toLowerCase();
    let relevantCategories = [];
    
    // Xác định các danh mục liên quan dựa trên message
    if (lowerMessage.includes('đồ uống') || lowerMessage.includes('nước')) {
        relevantCategories.push('Đồ uống');
    }
    if (lowerMessage.includes('món chính') || lowerMessage.includes('món ăn chính')) {
        relevantCategories.push('Món chính');
    }
    if (lowerMessage.includes('tráng miệng') || lowerMessage.includes('dessert')) {
        relevantCategories.push('Tráng miệng');
    }
    if (lowerMessage.includes('khuyến mãi') || lowerMessage.includes('giá')) {
        // Nếu hỏi về giá hoặc khuyến mãi, lấy tất cả các món có giá thấp nhất
        return formatMenuTextForPromotions(menuInfo);
    }
    
    // Nếu không xác định được danh mục cụ thể, lấy 3 món bán chạy nhất
    if (relevantCategories.length === 0) {
        return formatMenuTextForPopularItems(menuInfo);
    }

    let text = '📋 THÔNG TIN MÓN ĂN KIWI FASTFOOD 📋\n\n';
    
    relevantCategories.forEach(category => {
        if (menuInfo[category]) {
            text += `🔸 ${category.toUpperCase()} 🔸\n\n`;
            menuInfo[category].forEach(item => {
                text += `• ${item.name}\n`;
                text += `  💰 Giá: ${item.price}\n`;
                text += `  📝 Mô tả: ${item.description}\n`;
                text += `  📦 Còn lại: ${item.stock} phần\n\n`;
            });
        }
    });
    
    return text;
}

// Helper function to format menu text for recommendations
function formatMenuTextForRecommendations(menuInfo, preferences) {
    const lowerPreferences = preferences.toLowerCase();
    let relevantCategories = [];
    
    // Xác định các danh mục phù hợp với sở thích
    if (lowerPreferences.includes('ngọt') || lowerPreferences.includes('dessert')) {
        relevantCategories.push('Tráng miệng');
    }
    if (lowerPreferences.includes('mặn') || lowerPreferences.includes('chính')) {
        relevantCategories.push('Món chính');
    }
    if (lowerPreferences.includes('uống') || lowerPreferences.includes('nước')) {
        relevantCategories.push('Đồ uống');
    }
    
    // Nếu không xác định được sở thích cụ thể, lấy các món phổ biến
    if (relevantCategories.length === 0) {
        return formatMenuTextForPopularItems(menuInfo);
    }

    let text = '📋 GỢI Ý MÓN ĂN PHÙ HỢP 📋\n\n';
    
    relevantCategories.forEach(category => {
        if (menuInfo[category]) {
            text += `🔸 ${category.toUpperCase()} 🔸\n\n`;
            menuInfo[category].forEach(item => {
                text += `• ${item.name}\n`;
                text += `  💰 Giá: ${item.price}\n`;
                text += `  📝 Mô tả: ${item.description}\n`;
                text += `  📦 Còn lại: ${item.stock} phần\n\n`;
            });
        }
    });
    
    return text;
}

// Helper function to format menu text for promotions
function formatMenuTextForPromotions(menuInfo) {
    let text = '💰 KHUYẾN MÃI & GIÁ TỐT 💰\n\n';
    
    // Lấy 5 món có giá thấp nhất từ mỗi danh mục
    Object.entries(menuInfo).forEach(([category, items]) => {
        const sortedItems = [...items].sort((a, b) => {
            const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
            const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
            return priceA - priceB;
        }).slice(0, 5);

        if (sortedItems.length > 0) {
            text += `🔸 ${category.toUpperCase()} 🔸\n\n`;
            sortedItems.forEach(item => {
                text += `• ${item.name}\n`;
                text += `  💰 Giá: ${item.price}\n`;
                text += `  📝 Mô tả: ${item.description}\n`;
                text += `  📦 Còn lại: ${item.stock} phần\n\n`;
            });
        }
    });
    
    return text;
}

// Helper function to format menu text for popular items
function formatMenuTextForPopularItems(menuInfo) {
    let text = '🌟 MÓN ĂN PHỔ BIẾN 🌟\n\n';
    
    // Lấy 3 món có số lượng tồn cao nhất từ mỗi danh mục
    Object.entries(menuInfo).forEach(([category, items]) => {
        const sortedItems = [...items].sort((a, b) => b.stock - a.stock).slice(0, 3);

        if (sortedItems.length > 0) {
            text += `🔸 ${category.toUpperCase()} 🔸\n\n`;
            sortedItems.forEach(item => {
                text += `• ${item.name}\n`;
                text += `  💰 Giá: ${item.price}\n`;
                text += `  📝 Mô tả: ${item.description}\n`;
                text += `  📦 Còn lại: ${item.stock} phần\n\n`;
            });
        }
    });
    
    return text;
}

// Middleware to compress responses
router.use(compression());

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

        // Get current menu information (now cached)
        const menuInfo = await getMenuInfo();
        const menuText = formatMenuTextForChat(menuInfo, message);
        
        const response = await grokClient.post('', {
            model: "grok-2-latest",
            messages: [
                {
                    role: "system", 
                    content: `Bạn là trợ lý AI của Kiwi Fastfood, một nhà hàng đồ ăn nhanh. Dưới đây là thông tin thực đơn liên quan đến câu hỏi của khách hàng:

${menuText}

Hãy giúp khách hàng với thông tin về thực đơn, giá cả, cách đặt hàng, và các ưu đãi. Khi trả lời:
- Sử dụng emoji phù hợp để làm nổi bật thông tin
- Format text rõ ràng, dễ đọc với các bullet points và dòng mới
- Đảm bảo giá được hiển thị đúng định dạng tiền VND
- Luôn kiểm tra số lượng còn lại trước khi đề xuất món
- Trả lời bằng tiếng Việt, lịch sự và thân thiện
- Trả lời ngắn gọn, tập trung vào thông tin được hỏi`
                },
                {
                    role: "user", 
                    content: message
                }
            ],
            max_tokens: 300, // Giảm max_tokens để tăng tốc độ phản hồi
            temperature: 0.7,
            presence_penalty: 0.6,
            frequency_penalty: 0.6,
        });
        
        const aiResponse = response.data.choices[0].message.content.trim();
        
        res.json({
            success: true,
            response: aiResponse
        });
        
    } catch (error) {
        console.error('Grok API Error:', error.response?.data || error.message);
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

        // Get current menu information (now cached)
        const menuInfo = await getMenuInfo();
        const menuText = formatMenuTextForRecommendations(menuInfo, preferences);
        
        const response = await grokClient.post('', {
            model: "grok-2-latest",
            messages: [
                {
                    role: "system", 
                    content: `Bạn là chuyên gia tư vấn thực đơn cho Kiwi Fastfood. Dưới đây là các món ăn phù hợp với sở thích của khách hàng:

${menuText}

Dựa trên sở thích của khách hàng, hãy đề xuất 3 món ăn phù hợp nhất từ danh sách trên. Khi trả lời:
- Sử dụng emoji phù hợp cho từng loại món
- Format thông tin theo dạng danh sách rõ ràng
- Mỗi món ăn nên có: tên món, giá, mô tả ngắn gọn
- Chỉ đề xuất những món còn hàng
- Thêm ghi chú về khuyến mãi nếu có
- Trả lời bằng tiếng Việt
- Trả lời ngắn gọn, tập trung vào các món được đề xuất`
                },
                {
                    role: "user", 
                    content: `Sở thích của tôi: ${preferences}`
                }
            ],
            max_tokens: 300, // Giảm max_tokens để tăng tốc độ phản hồi
            temperature: 0.7,
            presence_penalty: 0.6,
            frequency_penalty: 0.6,
        });
        
        const recommendations = response.data.choices[0].message.content.trim();
        
        res.json({
            success: true,
            recommendations: recommendations
        });
        
    } catch (error) {
        console.error('Grok API Error:', error.response?.data || error.message);
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

        // Get current menu information (now cached)
        const menuInfo = await getMenuInfo();
        const menuText = formatMenuTextForPopularItems(menuInfo); // Sử dụng danh sách món phổ biến để tham khảo
        
        const response = await grokClient.post('', {
            model: "grok-2-latest",
            messages: [
                {
                    role: "system", 
                    content: `Bạn là chuyên gia ẩm thực viết mô tả hấp dẫn và lôi cuốn cho thực đơn nhà hàng. Dưới đây là một số món ăn phổ biến của nhà hàng để tham khảo:

${menuText}

Khi viết mô tả:
- Tập trung vào hương vị, cách chế biến và trải nghiệm ăn uống
- Sử dụng từ ngữ gợi cảm giác ngon miệng
- Giữ mô tả ngắn gọn, không quá 50 từ
- Đảm bảo phong cách nhất quán với các món khác trong menu
- Trả lời bằng tiếng Việt`
                },
                {
                    role: "user", 
                    content: `Viết mô tả hấp dẫn cho món "${foodName}" ${ingredients ? `với các nguyên liệu: ${ingredients}` : ''} cho thực đơn của nhà hàng Kiwi Fastfood.`
                }
            ],
            max_tokens: 200,
            temperature: 0.8,
            presence_penalty: 0.6,
            frequency_penalty: 0.6,
        });
        
        const description = response.data.choices[0].message.content.trim();
        
        res.json({
            success: true,
            description: description
        });
        
    } catch (error) {
        console.error('Grok API Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Error processing your request'
        });
    }
}));

module.exports = router; 