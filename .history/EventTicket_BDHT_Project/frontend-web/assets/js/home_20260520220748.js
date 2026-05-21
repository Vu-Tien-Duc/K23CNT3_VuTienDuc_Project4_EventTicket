/**
 * Script xử lý Trang Chủ (index.html)
 * Tác giả: Team Frontend (BDHT)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch dữ liệu từ API Backend
    fetchHomePageData();

    // 2. Kích hoạt tính năng tự chạy của Slider Banner
    startAutoSlide();
});

// ======================== GỌI API & RENDER ========================

async function fetchHomePageData() {
    try {
        // [ĐÃ SỬA CHỖ NÀY]: Dùng window.apiClient.get() và điền đủ đường dẫn Backend
        const responseData = await window.apiClient.get('/api/vtd/public/home');
        
        // Render Banners
        if (responseData.banners && responseData.banners.length > 0) {
            renderBanners(responseData.banners);
        }
        
        // Luôn luôn gọi hàm render để xử lý, dù mảng có rỗng hay không
        renderLatestEvents(responseData.latestEvents || []);
        renderFeaturedEvents(responseData.featuredEvents || []);

    } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
        
        // Fallback UI nếu API sập/lỗi kết nối
        document.getElementById('mini-slider-track').innerHTML = `
            <div class="w-full flex flex-col items-center justify-center py-16 bg-red-50 rounded-2xl border border-red-100">
                <p class="text-red-600 font-medium">Chưa có sự kiện này.</p>
            </div>`;
            
        document.getElementById('featured-events-wrapper').innerHTML = `
            <div class="w-full flex flex-col items-center justify-center py-20 bg-red-50 rounded-3xl border border-red-100">
                <p class="text-red-600 font-medium">Chưa có sự kiện này.</p>
            </div>`;
    }
}

// 1. Render Banner Ngẫu nhiên
function renderBanners(banners) {
    for (let i = 0; i < 3; i++) {
        const imgElement = document.getElementById(`banner-img-${i}`);
        if (imgElement && banners[i]) {
            // SỬA Ở ĐÂY: Ghép thêm đường dẫn thư mục local vào trước tên ảnh
            imgElement.src = `../assets/images/${banners[i]}`;
        }
    }
}

// 2. Render Sự kiện mới nhất (Thanh cuộn ngang)
function renderLatestEvents(events) {
    const track = document.getElementById('mini-slider-track');
    
    // XỬ LÝ KHI KHÔNG CÓ DỮ LIỆU
    if (events.length === 0) {
        track.innerHTML = `
            <div class="w-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed shadow-sm">
                <i class="far fa-calendar-times text-5xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 font-medium text-lg">Hiện tại không có sự kiện mới nhất nào được mở bán.</p>
                <p class="text-gray-400 text-sm mt-1">Vui lòng quay lại sau nhé!</p>
            </div>`;
        return;
    }

  
}

// 3. Render Sự kiện nổi bật (1 Thẻ siêu lớn + 4 Thẻ nhỏ)
function renderFeaturedEvents(events) {
    const wrapper = document.getElementById('featured-events-wrapper');

    // XỬ LÝ KHI KHÔNG CÓ DỮ LIỆU
    if (events.length === 0) {
        wrapper.innerHTML = `
            <div class="w-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed shadow-sm">
                <i class="fas fa-box-open text-6xl text-gray-300 mb-5"></i>
                <h3 class="text-gray-600 font-bold text-xl mb-1">Không có sự kiện nổi bật</h3>
                <p class="text-gray-400">Hệ thống chưa ghi nhận sự kiện nào lọt top thịnh hành lúc này.</p>
            </div>`;
        return;
    }

    // Nếu có dữ liệu, tạo cấu trúc Grid
    const topEvent = events[0];
    const nextEvents = events.slice(1, 5);

    let html = `<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">`;

    // Cột Trái: Sự kiện Top 1
    html += `
        <div class="lg:col-span-1">
            <div class="bg-white rounded-3xl overflow-hidden shadow-soft border border-gray-100 group cursor-pointer h-full flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-300" onclick="window.location.href='event-detail.html?id=${topEvent.eventId}'">
                <div class="relative h-64 lg:h-72 overflow-hidden">
                    <img src="../assets/images/${topEvent.bannerImageUrl || 'no-image.png'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="${topEvent.title}">
                    <div class="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1">
                        <i class="fas fa-fire"></i> Đáng chú ý
                    </div>
                </div>
                <div class="p-8 flex-1 flex flex-col bg-white relative">
                    <div class="absolute top-0 right-8 -mt-6 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-brand-purple font-bold text-xl">#1</div>
                    <h3 class="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors leading-tight">${topEvent.title}</h3>
                    <p class="text-gray-500 line-clamp-3 mb-6 text-sm flex-1 leading-relaxed">${topEvent.description || 'Sự kiện hấp dẫn không thể bỏ lỡ, đặt vé ngay hôm nay để có vị trí đẹp nhất!'}</p>
                    <div class="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                        <div>
                            <p class="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Giá vé từ</p>
                            <p class="text-2xl font-black text-brand-purple">${formatCurrency(topEvent.minPrice || 0)}</p>
                        </div>
                        <button class="bg-gray-900 hover:bg-brand-purple text-white px-7 py-3 rounded-full font-bold transition-colors shadow-md text-sm">Mua Vé</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">`;

    // Render các sự kiện nhỏ
    nextEvents.forEach(event => {
        html += `
            <div class="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer" onclick="window.location.href='event-detail.html?id=${event.eventId}'">
                <div class="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 relative">
                    <img src="../assets/images/${event.bannerImageUrl || 'no-image.png'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${event.title}">
                </div>
                <div class="flex flex-col py-1 justify-between">
                    <div>
                        <span class="text-[10px] font-bold text-brand-purple bg-purple-50 px-2 py-1 rounded uppercase tracking-widest mb-2 inline-block">${event.categoryName || 'Sự kiện'}</span>
                        <h4 class="font-bold text-gray-900 line-clamp-2 group-hover:text-brand-purple transition-colors leading-snug text-sm">${event.title}</h4>
                    </div>
                    <div class="mt-2 flex items-center justify-between">
                        <span class="text-brand-orange font-extrabold text-sm">${formatCurrency(event.minPrice || 0)}</span>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div></div>`; // Đóng grid con và grid tổng
    wrapper.innerHTML = html;
}

// ======================== UI HELPERS & LOGIC SLIDER ========================
let currentSlide = 0;
const totalSlides = 3;
let autoSlideInterval;

function updateSliderUI() {
    const track = document.getElementById('hero-slider-track');
    const dots = document.querySelectorAll('.hero-dot');
    
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('bg-white', 'active', 'shadow-md');
            dot.classList.remove('bg-white/40');
        } else {
            dot.classList.remove('bg-white', 'active', 'shadow-md');
            dot.classList.add('bg-white/40');
        }
    });
}

function moveHeroSlide(direction) {
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    updateSliderUI();
    resetAutoSlide();
}

function setHeroSlide(index) {
    currentSlide = index;
    updateSliderUI();
    resetAutoSlide();
}

function startAutoSlide() {
    autoSlideInterval = setInterval(() => moveHeroSlide(1), 5000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

function scrollMiniSlider(offset) {
    const track = document.getElementById('mini-slider-track');
    if (track) track.scrollBy({ left: offset, behavior: 'smooth' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'Đang cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}