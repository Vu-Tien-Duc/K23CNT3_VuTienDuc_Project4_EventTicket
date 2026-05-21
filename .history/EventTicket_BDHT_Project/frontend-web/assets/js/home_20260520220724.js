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

    let htmlContent = '';
    events.forEach(event => {
        htmlContent += `
        <div class="mini-slider-card snap-start bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col" onclick="window.location.href='event-detail.html?id=${event.eventId}'">
            <div class="h-44 overflow-hidden relative">
                <img src="../assets/images/${event.bannerImageUrl || 'no-image.png'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${event.title}">
                <div class="absolute top-3 left-3 bg-white/95 backdrop-blur text-brand-orange text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    ${event.categoryName || 'Sự kiện'}
                </div>
            </div>
            <div class="p-5 flex flex-col flex-1">
                <h3 class="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-brand-orange transition-colors leading-snug">${event.title}</h3>
                <p class="text-sm text-gray-500 mb-4 flex items-center gap-2"><i class="far fa-calendar-alt text-gray-400"></i> ${formatDate(event.createdAt)}</p>
                
                <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Giá từ</p>
                        <span class="text-brand-orange font-extrabold text-lg">${formatCurrency(event.minPrice || 0)}</span>
                    </div>
                    <span class="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-colors text-brand-orange shadow-sm"><i class="fas fa-arrow-right text-sm"></i></span>
                </div>
            </div>
        </div>`;
    });
    track.innerHTML = htmlContent;
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