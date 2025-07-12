function changeValue(id, delta) {
  const el = document.getElementById(id);
  let val = parseInt(el.textContent) || 0;
  val = Math.max(0, val + delta);
  el.textContent = val;
}

document.getElementById("lunchToggle").addEventListener("change", function () {
  document.getElementById("lunchOptions").classList.toggle("hidden", !this.checked);
});

function formatVND(number) {
  return number.toLocaleString("vi-VN").replaceAll(".", ",");
}

function generateMessage() {
  const bookingId = document.getElementById("bookingId").value.trim();
  const priceVND = parseInt(document.getElementById("roomPrice").value) || 0;
  const roomQty = parseInt(document.getElementById("roomQty").textContent) || 1;
  const scQty = parseInt(document.getElementById("scQty").textContent) || 0;
  const lunchToggle = document.getElementById("lunchToggle").checked;
  const lunchDate = document.getElementById("lunchDate").value.trim().replace(/\s+/g, "");
  const adultQty = parseInt(document.getElementById("adultQty").textContent) || 0;
  const childQty = parseInt(document.getElementById("childQty").textContent) || 0;
  const lateQty = parseInt(document.getElementById("lateQty").textContent) || 0;
  const earlyQty = parseInt(document.getElementById("earlyQty").textContent) || 0;
  const ebaQty = parseInt(document.getElementById("ebaQty").textContent) || 0;
  const ebcQty = parseInt(document.getElementById("ebcQty").textContent) || 0;
  const upgradeTwin = document.getElementById("upgradeTwin").checked;
  const upgradeKing = document.getElementById("upgradeKing").checked;
  const changeTwin = document.getElementById("changeTwin").checked;
  const changeKing = document.getElementById("changeKing").checked;

  let result = "";

  if (upgradeTwin) result += `Khách sạn đã cập nhật FREE upgrade Twin Studio Ocean View.\n\n`;
  if (upgradeKing) result += `Khách sạn đã cập nhật FREE upgrade King Studio Ocean View.\n\n`;
  if (changeTwin) result += `Khách sạn đã cập nhật sửa đổi thành phòng Twin Studio City View.\n\n`;
  if (changeKing) result += `Khách sạn đã cập nhật sửa đổi thành phòng King Studio City View.\n\n`;

  if (ebaQty > 0) result += `Đã ghi nhận ${ebaQty.toString().padStart(2, '0')} EBA trên hệ thống.\n`;
  if (ebcQty > 0) result += `Đã ghi nhận ${ebcQty.toString().padStart(2, '0')} EBC trên hệ thống.\n`;

  const extra = [];
  if (lateQty > 0) extra.push(`${lateQty.toString().padStart(2, '0')} Late Check Out trước 18:00`);
  if (earlyQty > 0) extra.push(`${earlyQty.toString().padStart(2, '0')} Early Check In sau 06:00`);

  if (lunchToggle && lunchDate) {
    let lunchLine = `Lunch on ${lunchDate}/all`;
    const sub = [];
    if (adultQty > 0) sub.push(`${adultQty} bữa trưa người lớn`);
    if (childQty > 0) sub.push(`${childQty} bữa trưa trẻ em`);
    if (sub.length > 0) lunchLine += ` (thêm ${sub.join(" và ")} tính tiền)`;
    extra.push(lunchLine);
  }

  let totalVND = priceVND * roomQty;
  totalVND += Math.floor(priceVND / 2) * (lateQty + earlyQty);
  totalVND += 175000 * childQty + 350000 * adultQty;
  totalVND += 200000 * ebcQty + 975000 * ebaQty;

  const totalUSD = (totalVND / 25000).toFixed(2);
  const totalUSDStr = totalUSD.endsWith(".00") ? parseInt(totalUSD) : totalUSD;

  result += `\nĐối với đặt phòng ${bookingId} đã đặt thành công trên hệ thống`;
  if (extra.length > 0) result += `, phát sinh ${extra.join(" và ")}`;
  result += `, bộ phận xin phép gửi lại tổng tiền của đặt phòng là ${totalUSDStr} USD.`;

  const rmLabel = `${roomQty.toString().padStart(2, '0')} RM`;
  let rmLine = `\n\n${rmLabel} (${formatVND(priceVND)} VND/P/D) + BB`;

  if (lateQty > 0) rmLine += ` + ${lateQty.toString().padStart(2, '0')} LCO@18:00 (${formatVND(Math.floor(priceVND / 2))} VND/P/D)`;
  if (earlyQty > 0) rmLine += ` + ${earlyQty.toString().padStart(2, '0')} ECI@06:00 (${formatVND(Math.floor(priceVND / 2))} VND/P/D)`;

  if (lunchToggle && lunchDate) {
    rmLine += ` + Lunch on ${lunchDate}`;
    const lunchDetail = ["02 PAX FOC"];
    if (childQty > 0) lunchDetail.push(`+ ${childQty.toString().padStart(2, '0')} PAX TE: 175,000 VND/PAX`);
    if (adultQty > 0) lunchDetail.push(`+ ${adultQty.toString().padStart(2, '0')} PAX NL: 350,000 VND/PAX`);
    rmLine += ` (${lunchDetail.join(" ")})`;
  }

  if (scQty > 0) rmLine += ` + ${scQty.toString().padStart(2, '0')} SC FOC`;
  if (ebcQty > 0) rmLine += ` + ${ebcQty.toString().padStart(2, '0')} EBC (200,000 VND/P/D)`;
  if (ebaQty > 0) rmLine += ` + ${ebaQty.toString().padStart(2, '0')} EBA (975,000 VND/P/D)`;

  rmLine += ` TO TA AFTER CO\nXTRA TO POA`;
  if (lunchToggle && lunchDate) {
    rmLine += `\n--> LT xác nhận thông tin về thời gian dùng bữa (ngày /giờ)  và  loại set menu  khi check in cho khách  và báo thông tin cho nhà hàng nhé)`;
  }

  rmLine += `\n\n→ Tổng tiền: ${formatVND(totalVND)} VND ≈ ${totalUSDStr} USD`;

  document.getElementById("resultText").value = result.trim() + rmLine;
}