// Hàm định dạng tiền VND với dấu phẩy (chuẩn Việt Nam)
function formatVND(amount) {
  if (!amount || isNaN(amount)) return "VND";
  return Number(amount).toLocaleString('vi-VN').replaceAll('.', ',');
}

// Biến lưu số lượng SC và EBA
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

function generateResult() {
  const code = document.getElementById('codeInput').value.trim().toUpperCase();
  const rmRaw = document.getElementById('rmInput').value.trim();
  const rm = rmRaw.replaceAll(',', '').replaceAll('.', '');
  const sc = scCount;
  const eba = ebaCount;
  const hasDO = code.includes("DO") || code.includes("D12");

  if (!rm || isNaN(rm)) {
    document.getElementById("result").innerText = "Vui lòng nhập số tiền RM hợp lệ.";
    return;
  }

  let result = `RM (${formatVND(rm)} VND r/n)`;

  // 1. BV hoặc BB
  if (code.includes("BV")) {
    result += ` + BV`;
  } else if (code.includes("BB")) {
    result += ` + BB`;
  }

  // 2. SC và EBA
  if (sc > 0) result += ` + ${sc.toString().padStart(2, '0')} SC (${getSCPrice(code, hasDO)})`;
  if (eba > 0) result += ` + ${eba.toString().padStart(2, '0')} EBA (${getEBAPrice(code, hasDO)})`;

  // 3. Ưu đãi PR33003, PR33004
  if (code.includes("PR33003")) {
    result += ` + PR33003: Tặng Aquafiled HOẶC SHOW BÁCH NGHỆ - HẠNG VÉ NGÀY MÙA cho tất cả các khách
Ưu đãi tặng kèm AQF / Show bách nghệ, QLDT đã add sẵn pkg AQF trong Rate code. Nếu khách hàng có như cầu chọn ưu đãi Show Bách Nghệ, Vé Ngày mùa, FO Team giúp gỡ pkg AQF + add pkg Show bách nghệ`;
  } else if (code.includes("PR33004")) {
    result += ` + PR33004: Miễn phí 02 trẻ em dưới 12 tuổi gói BB (không EB)`;
  }

  // 4. Ưu đãi từ BA
  if (code.includes("BA")) {
    result += ` + Tặng vé Ngày Mùa => FO/ Res team gán package BN-NGAYMUA-IN vào ngày khách sử dụng dịch vụ`;
  }

  // 5. Hậu mãi
  if (hasDO) {
    result += ` to TA after C/o\nXtra to POA`;
  } else {
    result += ` to TA b4 C/I\nXtra to POA`;
  }

  // 6. Tổng tiền nếu có SC hoặc EBA
  let total = Number(rm);
  if (sc > 0) total += sc * getSCPriceRaw(code, hasDO);
  if (eba > 0) total += eba * getEBAPriceRaw(code, hasDO);

  if (sc > 0 || eba > 0) {
    result += `\n\nTổng: ${formatVND(total)} VND`;
  }

  document.getElementById("result").innerText = result;
}

// Trả về chuỗi giá SC
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

// Trả về chuỗi giá EBA
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

// Trả về số giá SC để tính tổng tiền
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

// Trả về số giá EBA để tính tổng tiền
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