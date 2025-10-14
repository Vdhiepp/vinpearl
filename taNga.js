// ====== 🔹 HÀM XỬ LÝ CHUNG 🔹 ======

// Hàm parse ngày linh hoạt (chấp nhận nhiều định dạng)
function parseDate(input) {
  if (!input) return null;
  const clean = input.replace(/[-.]/g, '/').trim();
  const parts = clean.split('/');
  if (parts.length < 3) return null;
  let d = parseInt(parts[0]);
  let m = parseInt(parts[1]);
  let y = parseInt(parts[2]);
  if (y < 100) y += 2000;
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return null;
  return date;
}

// Format ngày về dạng DD-MM-YYYY
function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

// ====== 🔹 DANH SÁCH GIAI ĐOẠN KHUYẾN MÃI 🔹 ======
// Bạn chỉ cần thêm các khoảng thời gian mới vào đây
const promoPeriods = [
  { start: new Date(2026, 1, 17), end: new Date(2026, 1, 24), name: "I1BBOD" },
  { start: new Date(2027, 1, 6), end: new Date(2027, 1, 13), name: "I1BBOD" },
  { start: new Date(2025, 11, 24), end: new Date(2026, 0, 5), name: "I1BBOD" },
  { start: new Date(2026, 3, 30), end: new Date(2026, 4, 2), name: "I1BBOD" },
  { start: new Date(2026, 4, 25), end: new Date(2026, 7, 15), name: "I1BBOD" },
  { start: new Date(2026, 11, 24), end: new Date(2027, 0, 5), name: "I1BBOD" }
];

// ====== 🔹 CÁC DÒNG MÔ TẢ CHO LỰA CHỌN 🔹 ======
const extraMessages = {
  1: `Anex - từ 1/12/2025 áp dụng Stay Pay

RM (r/n) + BB + x night FOC to TA after C/o
Xtra to POA
Giảm 20% giá công bố cho tất cả các dịch vụ onsite bao gồm FB và minibar (không bao gồm rượu mạnh), SPA, Laundry (không bao gồm giặt khô và giặt nhanh) & room services.`,
  2: `Pegas - từ 1/12/2025 áp dụng Stay Pay

RM (r/n) + BB + x night FOC to TA b4 C/I
Xtra to POA`,
  3: `AB Tour - từ 1/12/2025 áp dụng Stay Pay

RM (r/n) + BB + x night FOC to TA b4 C/I
Xtra to POA
Giảm 20% giá công bố cho tất cả các dịch vụ onsite bao gồm FB và minibar (không bao gồm rượu mạnh), SPA, Laundry (không bao gồm giặt khô và giặt nhanh) & room services.`,
  4: `Amega - từ 1/12/2025 áp dụng Stay Pay

RM (r/n) + BB + x night FOC to TA b4 C/I
Xtra to POA
Giảm 20% giá công bố cho tất cả các dịch vụ onsite bao gồm FB và minibar (không bao gồm rượu mạnh), SPA, Laundry (không bao gồm giặt khô và giặt nhanh) & room services.`,
  5: `Fun & Sun - từ 1/12/2025 KHÔNG áp dụng Stay Pay

RM (r/n) + BB to TA b4 C/I
Xtra to POA`,
  6: `Odeon - từ 1/12/2025 KHÔNG áp dụng Stay Pay

RM (r/n) + BB to TA b4 C/I
Xtra to POA`,
  7: `GreenTravel - từ 1/12/2025 KHÔNG áp dụng Stay Pay

RM (r/n) + BB to TA b4 C/I
Xtra to POA`,
  8: `VietOne - từ 1/12/2025 KHÔNG áp dụng Stay Pay

RM (r/n) + BB to TA b4 C/I
Xtra to POA`,
  9: `Crystal - từ 1/12/2025 KHÔNG áp dụng Stay Pay

RM (r/n) + BB to TA b4 C/I
Xtra to POA`,
  10: `Rustar - từ 1/12/2025 KHÔNG áp dụng Stay Pay

RM (r/n) + BB to TA b4 C/I
Xtra to POA`,
  11: `Prestige - từ 1/12/2025 KHÔNG áp dụng Stay Pay

RM (r/n) + BB to TA b4 C/I
Xtra to POA`,
  12: `Selfie Travel - KHÔNG áp dụng Stay Pay

RM (r/n) + BB to TA b4 C/I
Xtra to POA`,
  13: `Concierge Travel - KHÔNG áp dụng Stay Pay

RM (r/n) + BB to TA b4 C/I
Xtra to POA`
};

// ====== 🔹 HÀM CHÍNH KIỂM TRA KHUYẾN MÃI 🔹 ======
function checkPromo() {
  const startInput = document.getElementById('start').value;
  const endInput = document.getElementById('end').value;
  const option = document.getElementById('option').value;
  const result = document.getElementById('result');
  result.innerHTML = '';

  if (!option) {
    result.innerHTML = '<span style="color:red">⚠️ Vui lòng chọn một lựa chọn trước khi kiểm tra.</span>';
    return;
  }

  const startDate = parseDate(startInput);
  const endDate = parseDate(endInput);

  if (!startDate || !endDate) {
    result.innerHTML = '<span style="color:red">❌ Ngày nhập không hợp lệ</span>';
    return;
  }

  if (startDate >= endDate) {
    result.innerHTML = '<span style="color:red">❌ Ngày check-out phải sau ngày check-in</span>';
    return;
  }

  let output = '';
  let nightCount = 0;

  // Duyệt từ ngày check-in đến NGÀY TRƯỚC check-out
  let current = new Date(startDate);
  while (current < endDate) {  // 🔹 chỉ nhỏ hơn, không bằng
    const formatted = formatDate(current);

    // Kiểm tra giai đoạn khuyến mãi
    const promo = promoPeriods.find(
      p => current >= p.start && current <= p.end
    );

    if (promo) {
      output += `<div class="promo">${formatted}: ${promo.name}</div>`;
    } else {
      output += `<div class="no-promo">${formatted}: PR22100BB</div>`;
    }

    nightCount++;
    current.setDate(current.getDate() + 1);
  }

  // Hiển thị mô tả lựa chọn
  if (extraMessages[option]) {
    output += `<div class="extra">${extraMessages[option]}</div>`;
  }

  // Hiển thị tổng số đêm
  const nightText = nightCount < 10 ? `0${nightCount}` : nightCount;
  output += `<div style="margin-top:10px;font-weight:bold;color:#007bff">Tổng: ${nightText} đêm</div>`;

  result.innerHTML = output;

  // Cuộn xuống kết quả
  result.scrollIntoView({ behavior: "smooth" });
}