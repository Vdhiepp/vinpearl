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
  { start: new Date(2026, 11, 24), end: new Date(2027, 0, 5), name: "I1BBOD" },
  { start: new Date(2026, 3, 1), end: new Date(2028, 0, 31), name: "I1BBOD" }
];

// ====== 🔹 CÁC DÒNG MÔ TẢ CHO LỰA CHỌN 🔹 ======
const extraMessages = {
  1: `Anex - Fun & Sun (HBBBFS) --> Stay Pay đến hết 31/12/2026

RM (r/n) + BB + x night FOC to TA after C/o
Xtra to POA
Giảm 20% giá công bố cho tất cả các dịch vụ onsite bao gồm FB và minibar (không bao gồm rượu mạnh), SPA, Laundry (không bao gồm giặt khô và giặt nhanh) & room services.`,
  2: `Pegas - AB Tour - Amega - Odeon - GreenTravel - Concierge Travel - Crystal - Fun & Sun (PR22100BB) --> Stay Pay đến hết 31/12/2026

RM (r/n) + BB + x night FOC to TA b4 C/I
Xtra to POA
Giảm 20% giá công bố cho tất cả các dịch vụ onsite bao gồm FB và minibar (không bao gồm rượu mạnh), SPA, Laundry (không bao gồm giặt khô và giặt nhanh) & room services.`,
  3: `VietOne --> Stay Pay đến hết 31/03/2026

RM (r/n) + BB + x night FOC to TA b4 C/I
Xtra to POA
Giảm 20% giá công bố cho tất cả các dịch vụ onsite bao gồm FB và minibar (không bao gồm rượu mạnh), SPA, Laundry (không bao gồm giặt khô và giặt nhanh) & room services.`,
  4: `Rustar - Prestige - Selfie Travel --> KHÔNG áp dụng Stay Pay

RM (r/n) + BB to TA b4 C/I
Xtra to POA`,

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
  while (current < endDate) {
    const formatted = formatDate(current);

    // Kiểm tra giai đoạn khuyến mãi
    const promo = promoPeriods.find(
      p => current >= p.start && current <= p.end
    );

    if (promo) {
      const promoName =
        option === "1"
          ? `${promo.name} / HBBBFS`
          : promo.name;

      output += `<div class="promo">${formatted}: ${promoName}</div>`;
    } else {
  const noPromoCode = option === "1"
    ? "PR22100BB / HBBBFS"
    : "PR22100BB";

    output += `<div class="no-promo">${formatted}: ${noPromoCode}</div>`;
    } 

    nightCount++;
    current.setDate(current.getDate() + 1);
  }

  // ====== 🔸 TÍNH TỔNG SỐ ĐÊM 🔸 ======
  const nightText = nightCount < 10 ? `0${nightCount}` : nightCount;
  output += `<div style="margin-top:10px;font-weight:bold;color:#007bff">Tổng: ${nightText} đêm</div>`;

  // ====== 🔸 HIỂN THỊ MÔ TẢ LỰA CHỌN 🔸 ======
  if (extraMessages[option]) {
    output += `<div class="extra">${extraMessages[option]}</div>`;
  }

  // ====== 🔸 TẶNG QUÀ THEO NGÀY VÀ LỰA CHỌN 🔸 ======
  const promoDate = new Date(2025, 11, 1); // 1-12-2025 (tháng 11 vì JS đếm từ 0)
  let giftText = "";

  if (startDate < promoDate) {
    if (option == "1" || option == "2" || option == "3" || option == "4" || option == "7" ) giftText = "PR22100BB: + 01 SC(300,000 VND/P/D) + 01 UGEBC(202,500 VND/P/D)";
    else if (option == "5" || option == "6") giftText = "PR22001BB: + 01 SC(312,000 VND/P/D) + 01 UGEBC(195,000 VND/P/D)";
    else if (option == "8") giftText = "PR22105BB: + 01 SC(320,000 VND/TE/D)+ 01 UGEBC(216,000 VND/P/D)<br><br>I1BBOSD05: + 01 SC(380,000 VND/TE/D)+ 01 UGEBC(256,500 VND/P/D)";
  } else {
    if (option == "1" || option == "2" || option == "4") giftText = "PR22100BB: + 01 SC(315,000 VND/P/D) + 01 UGEBC(210,000 VND/P/D)<br> + 01 EBA(1,035,000 VND/P/D)<br><br>I1BBOD: + 01 SC(378,000 VND/P/D) + 01 UGEBC(252,000 VND/P/D)<br> + 01 EBA(1,242,000 VND/P/D)";
    else if (option == "3") giftText = "PR22105BB: + 01 SC(326,000 VND/P/D) + 01 UGEBC(224,000 VND/P/D)<br> + 01 EBA(1,104,000 VND/P/D)<br><br>I1BBOSLH: + 01 SC(420,000 VND/P/D) + 01 UGEBC(280,000 VND/P/D)<br> + 01 EBA(1,380,000 VND/P/D)";
  }

  if (giftText) {
    output += `<div style="margin-top:12px;padding:8px;background:#fff8dc;border-left:4px solid #ff9800;border-radius:6px">
      <strong>${giftText}</strong>
    </div>`;
  }

  result.innerHTML = output;
  result.scrollIntoView({ behavior: "smooth" });
}