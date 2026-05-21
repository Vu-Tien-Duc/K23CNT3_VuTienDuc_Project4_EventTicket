/**
 * Script xử lý riêng cho Trang Chủ (index.html)
 * Tác giả: Team Frontend (BDHT)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tải header và footer dùng chung (Tùy chọn nếu team đã code hàm load)
    // loadSharedComponents(); 

    // 2. Fetch dữ liệu từ API Backend
    fetchHomePageData();

    // 3. Kích hoạt tính năng tự chạy của Slider Banner
    startAutoSlide();
});

// ======================== GỌI API & RENDER ========================

async function fetchHomePageData() {
    try {
        // Dùng apiClient (đã định nghĩa ở core/api-client.js)
        const responseData = await apiClient('/public/home', 'GET');
        
        // Render 3 mảng dữ liệu chính
        if (responseData.banners && responseData.banners.length > 0) {
            renderBanners(responseData.banners);
        }
        
        if (responseData.latestEvents) {
            renderLatestEvents(responseData.latestEvents);
        }

        if (responseData.featuredEvents) {
            renderFeaturedEvents(responseData.featuredEvents);
        }

    } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
        // Fallback UI nếu lỗi
        document.getElementById('mini-slider-track').innerHTML = `<p class="text-red-500 w-full text-center">Không thể tải dữ liệu sự kiện lúc này.</p>`;
    }
}

// 1. Render Banner Ngẫu nhiên
function renderBanners(banners) {
    // API trả về mảng chuỗi URL ảnh. Đổ tối đa 3 ảnh vào HTML.
    for (let i = 0; i < 3; i++) {
        const imgElement = document.getElementById(`banner-img-${i}`);
        if (imgElement && banners[i]) {
            imgElement.src = banners[i];
        }
    }
}

// 2. Render Sự kiện mới nhất (Thanh cuộn ngang)
function renderLatestEvents(events) {
    const track = document.getElementById('mini-slider-track');
    if (events.length === 0) {
        track.innerHTML = `<p class="text-gray-500">Chưa có sự kiện mới nào.</p>`;
        return;
    }

    let htmlContent = '';
    events.forEach(event => {
        htmlContent += `
        <div class="mini-slider-card snap-start bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer" onclick="window.location.href='event-detail.html?id=${event.eventId}'">
            <div class="h-40 overflow-hidden relative">
                <img src="${event.bannerImageUrl || 'https://via.placeholder.com/300'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="${event.title}">
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur text-brand-purple text-xs font-bold px-2 py-1 rounded shadow-sm">
                    ${event.categoryName || 'Sự kiện'}
                </div>
            </div>
            <div class="p-5">
                <h3 class="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-brand-purple transition-colors">${event.title}</h3>
                <p class="text-sm text-gray-500 mb-1"><i class="far fa-calendar-alt w-5 text-gray-400"></i> ${formatDate(event.createdAt)}</p>
                <div class="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span class="text-brand-orange font-extrabold">${formatCurrency(event.minPrice || 0)}</span>
                    <span class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-colors text-gray-400"><i class="fas fa-arrow-right text-xs"></i></span>
                </div>
            </div>
        </div>`;
    });
    track.innerHTML = htmlContent;
}

// 3. Render Sự kiện nổi bật (1 Thẻ siêu lớn + 4 Thẻ nhỏ)
function renderFeaturedEvents(events) {
    const giantContainer = document.getElementById('featured-giant-container');
    const gridContainer = document.getElementById('featured-grid-container');

    if (!events || events.length === 0) return;

    // Lấy sự kiện Top 1 đưa vào Thẻ Lớn
    const topEvent = events[0];
    giantContainer.innerHTML = `
        <div class="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 group cursor-pointer h-full flex flex-col hover:-translate-y-2 transition-transform duration-300" onclick="window.location.href='event-detail.html?id=${topEvent.eventId}'">
            <div class="relative h-64 lg:h-72 overflow-hidden">
                <img src="${topEvent.bannerImageUrl || 'https://via.placeholder.com/600'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="${topEvent.title}">
                <div class="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                    <i class="fas fa-fire mr-1"></i> Đáng chú ý
                </div>
            </div>
            <div class="p-8 flex-1 flex flex-col">
                <h3 class="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors">${topEvent.title}</h3>
                <p class="text-gray-500 line-clamp-3 mb-6 text-sm flex-1">${topEvent.description || 'Tham gia ngay sự kiện nổi bật nhất tháng này cùng hàng ngàn khán giả khác...'}</p>
                <div class="flex items-center justify-between mt-auto">
                    <div>
                        <p class="text-xs text-gray-400 uppercase font-semibold mb-1">Giá từ</p>
                        <p class="text-2xl font-black text-brand-orange">${formatCurrency(topEvent.minPrice || 0)}</p>
                    </div>
                    <button class="bg-gray-900 hover:bg-brand-purple text-white px-6 py-3 rounded-full font-bold transition-colors shadow-md">Mua Vé</button>
                </div>
            </div>
        </div>
    `;

    // Lấy 4 sự kiện tiếp theo đưa vào Grid nhỏ (Lấy từ index 1 đến 4)
    const nextEvents = events.slice(1, 5);
    let gridHtml = '';
    nextEvents.forEach(event => {
        gridHtml += `
        <div class="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer" onclick="window.location.href='event-detail.html?id=${event.eventId}'">
            <div class="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 relative">
                <img src="${event.bannerImageUrl || 'https://via.placeholder.com/150'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="${event.title}">
            </div>
            <div class="flex flex-col py-1">
                <span class="text-xs font-bold text-brand-purple uppercase tracking-wider mb-1">${event.categoryName || 'Sự kiện'}</span>
                <h4 class="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-brand-purple transition-colors leading-snug">${event.title}</h4>
                <div class="mt-auto flex items-center justify-between">
                    <span class="text-brand-orange font-bold text-sm">${formatCurrency(event.minPrice || 0)}</span>
                </div>
            </div>
        </div>
        `;
    });
    gridContainer.innerHTML = gridHtml;
}


// ======================== UI HELPERS & LOGIC SLIDER ========================

let currentSlide = 0;
const totalSlides = 3;
let autoSlideInterval;

function updateSliderUI() {
    const track = document.getElementById('hero-slider-track');
    const dots = document.querySelectorAll('.hero-dot');
    
    // Di chuyển track ảnh
    if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    // Cập nhật trạng thái dấu chấm (Dots)
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('bg-white', 'active');
            dot.classList.remove('bg-white/50');
        } else {
            dot.classList.remove('bg-white', 'active');
            dot.classList.add('bg-white/50');
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
    autoSlideInterval = setInterval(() => {
        moveHeroSlide(1);
    }, 5000); // Tự động chuyển slide sau mỗi 5 giây
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

// Xử lý nút cuộn ngang cho Sự kiện mới nhất
function scrollMiniSlider(offset) {
    const track = document.getElementById('mini-slider-track');
    if (track) {
        track.scrollBy({ left: offset, behavior: 'smooth' });
    }
}

// Format tiện ích
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}