// Giữ nguyên các hàm cũ
// ============================

function formatVND(amount) {
  if (!amount || isNaN(amount)) return "VND";
  return Number(amount).toLocaleString('vi-VN').replaceAll('.', ',');
}

let scCount = 0;
let ebaCount = 0;

function changeQty(type, delta) {
  if (type === 'sc') {
    scCount = Math.max(0, scCount + delta);
    document.getElementById('scQty').innerText = scCount;
  } else {
    ebaCount = Math.max(0, ebaCount + delta);
    document.getElementById('ebaQty').innerText = ebaCount;
  }
}

// ============================
// BỔ SUNG: SỐ NGÀY & Ô KHÁC
// ============================

let dayQty = 1;

function changeDay(delta) {
  dayQty = Math.max(1, dayQty + delta);
  document.getElementById('dayQty').innerText = dayQty;
  renderExtraInputs();
}

document.addEventListener('DOMContentLoaded', function() {
  const otherToggle = document.getElementById('otherToggle');
  if (otherToggle) {
    otherToggle.addEventListener('change', function() {
      renderExtraInputs();
    });
  }
});

function renderExtraInputs() {
  const otherToggle = document.getElementById('otherToggle');
  const extraContainer = document.getElementById('extraInputs');
  if (!otherToggle || !extraContainer) return;
  extraContainer.innerHTML = '';
  if (otherToggle.checked) {
    extraContainer.style.display = 'block';
    for (let i = 1; i < dayQty; i++) {
      const idx = i + 1;
      const codeLabel = document.createElement('label');
      codeLabel.textContent = `Mã sản phẩm (${idx}):`;
      const codeInput = document.createElement('input');
      codeInput.type = 'text';
      codeInput.className = 'extra-code';

      const rmLabel = document.createElement('label');
      rmLabel.textContent = `Giá RM (${idx}):`;
      const rmInput = document.createElement('input');
      rmInput.type = 'text';
      rmInput.className = 'extra-rm';

      extraContainer.appendChild(codeLabel);
      extraContainer.appendChild(codeInput);
      extraContainer.appendChild(rmLabel);
      extraContainer.appendChild(rmInput);
    }
  } else {
    extraContainer.style.display = 'none';
  }
}

// ============================
// HÀM CHÍNH: GENERATE RESULT
// ============================

function generateResult() {
  const otherToggle = document.getElementById('otherToggle');
  const isOther = otherToggle && otherToggle.checked;

  let sc = scCount;
  let eba = ebaCount;
  let totalAll = 0; // tổng tiền tất cả

  let resultLines = [];

  if (isOther) {
    // Nếu tick Khác thì đọc từ nhiều input
    const mainCode = document.getElementById('codeInput').value.trim().toUpperCase();
    const mainRMraw = document.getElementById('rmInput').value.trim().replaceAll(',', '').replaceAll('.', '');
    if (mainCode && !isNaN(mainRMraw) && mainRMraw !== '') {
      resultLines.push(buildLine(mainCode, Number(mainRMraw)));
      totalAll += Number(mainRMraw);
    }

    // đọc từ các cặp khác
    const extraCodes = document.querySelectorAll('#extraInputs .extra-code');
    const extraRMs = document.querySelectorAll('#extraInputs .extra-rm');
    for (let i = 0; i < extraCodes.length; i++) {
      const c = extraCodes[i].value.trim().toUpperCase();
      const rRaw = extraRMs[i].value.trim().replaceAll(',', '').replaceAll('.', '');
      if (c && rRaw && !isNaN(rRaw)) {
        resultLines.push(buildLine(c, Number(rRaw)));
        totalAll += Number(rRaw);
      }
    }

    // nếu có SC/EBA thì nhân số ngày
    let scEBAExtra = (sc * getSCPriceRaw('', false) + eba * getEBAPriceRaw('', false)) * dayQty;
    // nhưng SC/EBA hiện nay đang lấy theo code đầu tiên => bạn có thể mở rộng sau
    // ở đây mình giả định SC/EBA áp dụng chung
    if (sc > 0 || eba > 0) {
      totalAll += scEBAExtra;
    }

    let finalText = `RM to TA after C/o\n`;
    resultLines.forEach(l => {
      finalText += `DEM : ${l}\n`;
    });
    finalText += `Xtra to POA\nVới khách đặt gói BV/BB: Tặng vé Ngày Mùa => FO vui lòng gán package BN-NGAYMUA-IN vào ngày khách sử dụng dịch vụ (áp dụng khuyến mãi  tặng vé đến hết 29/7/2025)\n`;
    finalText += `Total: ${formatVND(totalAll)} VND`;
    document.getElementById("result").innerText = finalText;
    return;
  }

  // Nếu không tick Khác: xử lý như cũ nhưng nhân số ngày
  const code = document.getElementById('codeInput').value.trim().toUpperCase();
  const rmRaw = document.getElementById('rmInput').value.trim();
  const rm = rmRaw.replaceAll(',', '').replaceAll('.', '');
  const hasDO = code.includes("DO") || code.includes("D12");

  if (!rm || isNaN(rm)) {
    document.getElementById("result").innerText = "Vui lòng nhập số tiền RM hợp lệ.";
    return;
  }

  let rmNum = Number(rm);
  let rmTotal = rmNum * dayQty; // nhân số ngày

  let result = `RM (${formatVND(rmNum)} VND r/n)`;

  if (code.includes("BV")) {
    result += ` + BV`;
  } else if (code.includes("BB")) {
    result += ` + BB`;
  }

  if (sc > 0) {
    let price = getSCPriceRaw(code, hasDO);
    result += ` + ${sc.toString().padStart(2, '0')} SC (${getSCPrice(code, hasDO)})`;
    rmTotal += price * sc * dayQty;
  }
  if (eba > 0) {
    let price = getEBAPriceRaw(code, hasDO);
    result += ` + ${eba.toString().padStart(2, '0')} EBA (${getEBAPrice(code, hasDO)})`;
    rmTotal += price * eba * dayQty;
  }

  if (code.includes("PR33003")) {
    result += ` + PR33003: Tặng Aquafiled HOẶC SHOW BÁCH NGHỆ - HẠNG VÉ NGÀY MÙA cho tất cả các khách
Ưu đãi tặng kèm AQF / Show bách nghệ, QLDT đã add sẵn pkg AQF trong Rate code. Nếu khách hàng có như cầu chọn ưu đãi Show Bách Nghệ, Vé Ngày mùa, FO Team giúp gỡ pkg AQF + add pkg Show bách nghệ`;
  } else if (code.includes("PR33004")) {
    result += ` + PR33004: Miễn phí 02 trẻ em dưới 12 tuổi gói BB (không EB)`;
  }

  if (code.includes("BA")) {
    result += ` + Với khách đặt gói BV/BB: Tặng vé Ngày Mùa => FO vui lòng gán package BN-NGAYMUA-IN vào ngày khách sử dụng dịch vụ (áp dụng khuyến mãi  tặng vé đến hết 29/7/2025)`;
  }

  if (hasDO) {
    result += ` to TA after C/o\nXtra to POA`;
  } else {
    result += ` to TA b4 C/I\nXtra to POA`;
  }

  result += `\n\nTotal: ${formatVND(rmTotal)} VND`;
  document.getElementById("result").innerText = result;
}

// ============================
// HÀM HỖ TRỢ
// ============================

// hàm tạo 1 dòng DEM cho phần Khác
function buildLine(code, rmNum) {
  let text = `RM (${formatVND(rmNum)} VND r/n)`;
  if (code.includes("BV")) text += ` + BV`;
  else if (code.includes("BB")) text += ` + BB`;
  return text;
}

// giữ nguyên hàm giá SC/EBA
function getSCPrice(code, hasDO) {
  if (hasDO) {
    if (code.includes("BV") && code.includes("PR")) return "904,000 VND TE/N";
    if (code.includes("BV") && code.includes("BA")) return "1,056,000 VND TE/N";
    if (code.includes("BB")) return "376,000 VND TE/N";
  } else {
    if (code.includes("BV") && code.includes("PR")) return "943,550 VND TE/N";
    if (code.includes("BV") && code.includes("BA")) return "1,102,200 VND TE/N";
    if (code.includes("BB")) return "392,450 VND TE/N";
  }
  return "SC ???";
}

function getEBAPrice(code, hasDO) {
  if (hasDO) {
    if (code.includes("BV") && code.includes("PR")) return "1,776,000 VND NL/N";
    if (code.includes("BV") && code.includes("BA")) return "1,928,000 VND NL/N";
    if (code.includes("BB")) return "1,248,000 VND NL/N";
  } else {
    if (code.includes("BV") && code.includes("PR")) return " VND NL/N";
    if (code.includes("BV") && code.includes("BA")) return " VND NL/N";
    if (code.includes("BB")) return "1,302,600 VND NL/N";
  }
  return "EBA ???";
}

function getSCPriceRaw(code, hasDO) {
  if (hasDO) {
    if (code.includes("BV") && code.includes("PR")) return 904000;
    if (code.includes("BV") && code.includes("BA")) return 1056000;
    if (code.includes("BB")) return 376000;
  } else {
    if (code.includes("BV") && code.includes("PR")) return 943550;
    if (code.includes("BV") && code.includes("BA")) return 1102200;
    if (code.includes("BB")) return 392450;
  }
  return 0;
}

function getEBAPriceRaw(code, hasDO) {
  if (hasDO) {
    if (code.includes("BV") && code.includes("PR")) return 1776000;
    if (code.includes("BV") && code.includes("BA")) return 1928000;
    if (code.includes("BB")) return 1248000;
  } else {
    if (code.includes("BV") && code.includes("PR")) return 0;
    if (code.includes("BV") && code.includes("BA")) return 0;
    if (code.includes("BB")) return 1302600;
  }
  return 0;
}