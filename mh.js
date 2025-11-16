function changeValue(id, delta) {
  const el = document.getElementById(id);
  let val = parseInt(el.textContent) || 0;
  val = Math.max(0, val + delta);
  el.textContent = val;
}

document.getElementById("lunchToggle").addEventListener("change", function () {
  document.getElementById("lunchOptions").classList.toggle("hidden", !this.checked);
});

document.querySelectorAll(".preset-prices button").forEach(btn => {
  btn.addEventListener("click", function() {
    const price = parseInt(this.getAttribute("data-price"));
    document.getElementById("roomPrice").value = price;
  });
});

function formatVND(number) {
  return number.toLocaleString("vi-VN").replaceAll(".", ",");
}

function generateMessage() {
  const bookingId = document.getElementById("bookingId").value.trim();
  const priceVND = parseInt(document.getElementById("roomPrice").value) || 0;

  function getQty(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    if (el.tagName === "INPUT" || el.tagName === "SELECT") {
      return parseInt(el.value) || 0;
    } else {
      return parseInt(el.textContent) || 0;
    }
  }

  const roomQty = getQty("roomQty") || 1;
  const scQty = getQty("scQty");
  const adultQty = getQty("adultQty");
  const childQty = getQty("childQty");
  const lateQty = getQty("lateQty");
  const earlyQty = getQty("earlyQty");
  const ebaQty = getQty("ebaQty");
  const ebcQty = getQty("ebcQty");
  const dayQty = getQty("dayQty") || 1;

  const lunchToggle = document.getElementById("lunchToggle").checked;
  const lunchDate = document.getElementById("lunchDate").value.trim().replace(/\s+/g, "");
  const upgradeTwin = document.getElementById("upgradeTwin").checked;
  const upgradeKing = document.getElementById("upgradeKing").checked;

  let result = "";

  // Upgrade / Change Room Messages
  if (upgradeTwin) result += `Khách sạn đã cập nhật FREE upgrade Twin Studio Ocean View.\n\n`;
  if (upgradeKing) result += `Khách sạn đã cập nhật FREE upgrade King Studio Ocean View.\n\n`;

  // EBA / EBC Messages
  if (ebaQty > 0) result += `Đã ghi nhận ${ebaQty.toString().padStart(2, '0')} EBA trên hệ thống.\n`;
  if (ebcQty > 0) result += `Đã ghi nhận ${ebcQty.toString().padStart(2, '0')} EBC trên hệ thống.\n`;

  const extra = [];
  if (lateQty > 0) extra.push(`${lateQty.toString().padStart(2, '0')} Late Check Out trước 18:00`);
  if (earlyQty > 0) extra.push(`${earlyQty.toString().padStart(2, '0')} Early Check In sau 06:00`);

  // Lunch message
  if (lunchToggle && lunchDate) {
    let lunchLine = `Lunch on ${lunchDate}/all`;
    const sub = [];
    if (adultQty > 0) sub.push(`${adultQty} bữa trưa người lớn`);
    if (childQty > 0) sub.push(`${childQty} bữa trưa trẻ em`);
    if (sub.length > 0) lunchLine += ` (thêm ${sub.join(" và ")} tính tiền)`;
    extra.push(lunchLine);
  }

  // ----- TÍNH TOÁN TOTAL VND -----
  let totalVND = priceVND * roomQty * dayQty;

  const ebaAdd = 975000;
  const ebcAdd = 200000;

  // ----- LCO phân bổ -----
  const lcoLines = [];
  if (lateQty > 0) {
    const totalAdd = ebaQty * ebaAdd + ebcQty * ebcAdd;
    if (lateQty === 1) {
      // 1 LCO → cộng tất cả vào 1 dòng
      lcoLines.push({ qty: 1, price: Math.floor((priceVND + totalAdd)/2) });
    } else {
      let usedLate = 0;
      if (ebaQty > 0) { lcoLines.push({ qty: ebaQty, price: Math.floor((priceVND + ebaAdd)/2)}); usedLate += ebaQty; }
      if (ebcQty > 0) { lcoLines.push({ qty: ebcQty, price: Math.floor((priceVND + ebcAdd)/2)}); usedLate += ebcQty; }
      if (lateQty > usedLate) lcoLines.push({ qty: lateQty - usedLate, price: Math.floor(priceVND/2) });
    }
  }

  // ----- ECI phân bổ -----
  const eciLines = [];
  if (earlyQty > 0) {
    const totalAdd = ebaQty * ebaAdd + ebcQty * ebcAdd;
    if (earlyQty === 1) {
      eciLines.push({ qty: 1, price: Math.floor((priceVND + totalAdd)/2) });
    } else {
      let usedEarly = 0;
      if (ebaQty > 0) { eciLines.push({ qty: ebaQty, price: Math.floor((priceVND + ebaAdd)/2)}); usedEarly += ebaQty; }
      if (ebcQty > 0) { eciLines.push({ qty: ebcQty, price: Math.floor((priceVND + ebcAdd)/2)}); usedEarly += ebcQty; }
      if (earlyQty > usedEarly) eciLines.push({ qty: earlyQty - usedEarly, price: Math.floor(priceVND/2) });
    }
  }

  // Tổng LCO/ECI
  lcoLines.forEach(item => totalVND += item.qty * item.price);
  eciLines.forEach(item => totalVND += item.qty * item.price);

  // Thêm lunch
  totalVND += (175000 * childQty + 350000 * adultQty);

  // Thêm EBA / EBC nguyên ngày
  totalVND += (ebaQty * ebaAdd + ebcQty * ebcAdd) * dayQty;

  // Tổng USD
  const totalUSD = (totalVND / 25000).toFixed(2);

  // ----- MESSAGE CHÍNH -----
  result += `\nĐối với đặt phòng ${bookingId} đã đặt thành công trên hệ thống`;
  if (extra.length > 0) result += `, phát sinh ${extra.join(" và ")}`;
  result += `, bộ phận xin phép gửi lại tổng tiền của đặt phòng là ${totalUSD} USD.`;

  // ----- RM LINE -----
  const rmLabel = `${roomQty.toString().padStart(2,'0')} RM`;
  let rmLine = `\n\n${rmLabel} (${formatVND(priceVND)} VND/P/D) + BB`;
  if (scQty > 0) rmLine += ` + ${scQty.toString().padStart(2,'0')} SC FOC`;
  if (ebcQty > 0) rmLine += ` + ${ebcQty.toString().padStart(2,'0')} EBC (200,000 VND/P/D)`;
  if (ebaQty > 0) rmLine += ` + ${ebaQty.toString().padStart(2,'0')} EBA (975,000 VND/P/D)`;

  lcoLines.forEach(item => rmLine += ` + ${item.qty.toString().padStart(2,'0')} LCO@18:00 (${formatVND(item.price)} VND/P/D)`);
  eciLines.forEach(item => rmLine += ` + ${item.qty.toString().padStart(2,'0')} ECI@06:00 (${formatVND(item.price)} VND/P/D)`);

  if (lunchToggle && lunchDate) {
    const lunchFOCPax = roomQty * 2;
    const lunchDetail = [`${lunchFOCPax.toString().padStart(2,'0')} PAX FOC`];
    if (childQty > 0) lunchDetail.push(`+ ${childQty.toString().padStart(2,'0')} PAX TE: 175,000 VND/PAX`);
    if (adultQty > 0) lunchDetail.push(`+ ${adultQty.toString().padStart(2,'0')} PAX NL: 350,000 VND/PAX`);
    rmLine += ` + Lunch on ${lunchDate} (${lunchDetail.join(" ")})`;
  }

  rmLine += ` TO TA AFTER CO\nXTRA TO POA`;
  if (lunchToggle && lunchDate) {
    rmLine += `\n--> LT xác nhận thông tin về thời gian dùng bữa (ngày/giờ) và loại set menu khi check in cho khách và báo thông tin cho nhà hàng nhé)`;
  }

  rmLine += `\n\n→ Tổng tiền: ${formatVND(totalVND)} VND ≈ ${totalUSD} USD`;

  document.getElementById("resultText").value = result.trim() + rmLine;
}


document.getElementById("cleanBtn").addEventListener("click", function() {
  // Xóa tất cả input[type="text"], input[type="number"]
  document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
    if (input.id === "roomQty" || input.id === "dayQty") {
      input.value = 1;  // giữ mặc định là 1
    } else {
      input.value = '';
    }
  });
  
  // Reset tất cả checkbox
  document.querySelectorAll('input[type="checkbox"]').forEach(chk => chk.checked = false);
  
  // Reset tất cả span (số lượng)
  document.querySelectorAll('span').forEach(span => {
    if (span.id === "roomQty" || span.id === "dayQty") {
      span.textContent = "1";  // giữ mặc định là 1
    } else {
      span.textContent = '0';
    }
  });
  
  // Xóa textarea
  const resultText = document.getElementById("resultText");
  if (resultText) resultText.value = '';
});
