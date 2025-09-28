document.addEventListener("DOMContentLoaded", function () {
  const daysInput = document.getElementById("days");
  const dayInputsContainer = document.getElementById("dayInputs");
  const btnResult = document.getElementById("btnResult");
  const resultBox = document.getElementById("result");

  // fix cứng ghi chú chương trình
  const PROGRAM_NOTE = "abc";

  // render input cho từng ngày
  function renderDayInputs() {
    const days = parseInt(daysInput.value);
    dayInputsContainer.innerHTML = "";
    for (let i = 1; i <= days; i++) {
      dayInputsContainer.innerHTML += `
        <div class="day-block">
          <h4>Ngày ${i}</h4>
          <label>Ngày (dd/mm):</label>
          <input type="text" id="date${i}" placeholder="12/9">
          <label>Tiền phòng:</label>
          <input type="text" id="price${i}" placeholder="2,500,000">
          <label>Ratecode:</label>
          <input type="text" id="rate${i}" placeholder="PR33003BVD12">
        </div>
      `;
    }
  }
  renderDayInputs();
  daysInput.addEventListener("change", renderDayInputs);

  // khi bấm nút result
  btnResult.addEventListener("click", function () {
    const rooms = parseInt(document.getElementById("rooms").value);
    const days = parseInt(daysInput.value);
    const sc = parseInt(document.getElementById("sc").value);
    const eba = parseInt(document.getElementById("eba").value);
    const extraAdult = parseInt(document.getElementById("extraAdult").value);

    let lines = [];
    let góiSet = new Set();
    let góiTheoNgày = [];
    let allRatecodes = [];
    let total = 0, after = 0, b4 = 0;

    for (let i = 1; i <= days; i++) {
      const date = document.getElementById("date" + i).value;
      const price = parseInt((document.getElementById("price" + i).value || "0").replace(/,/g, ""));
      const rate = document.getElementById("rate" + i).value;

      // xác định gói
      let pkg = "RO";
      if (rate.includes("BB")) pkg = "BB";
      else if (rate.includes("BV")) pkg = "BV";
      góiSet.add(pkg);
      góiTheoNgày.push(pkg);

      allRatecodes.push(rate);

      let line = `Đêm ${date}: RM (${price.toLocaleString()} VND r/n)`;

      // chỉ thêm gói vào từng đêm nếu có nhiều gói khác nhau
      if (góiSet.size > 1) {
        line += ` + ${pkg}`;
      }

      if (sc > 0) line += ` + ${sc.toString().padStart(2, "0")} SC (${getSCPrice(pkg, rate).toLocaleString()} VND TE/N)`;
      if (eba > 0) line += ` + ${eba.toString().padStart(2, "0")} EBA (${getEBAPrice(pkg, rate).toLocaleString()} VND NL/N)`;
      if (extraAdult > 0) line += ` + ${extraAdult.toString().padStart(2, "0")} Phụ thu NL (${getEBAPrice(pkg, rate).toLocaleString()} VND NL/N)`;

      if (rate.includes("D12") || rate.includes("DO")) {
        line += " to TA after C/o";
        after += price * rooms;
      } else {
        line += " to TA b4 C/i";
        b4 += price * rooms;
      }

      total += price * rooms;
      lines.push(line);
    }

    // header
    const header = `${rooms.toString().padStart(2, "0")} RM + ${(góiSet.size === 1 ? [...góiSet][0] : "PP")}`;

    let output = header + "\n" + lines.join("\n") + "\nXtra to POA\n";

    // gom prefix ratecode
    let prefixes = new Set();
    allRatecodes.forEach(rc => {
      let prefix = rc.match(/^PR\d+/);
      if (prefix) prefixes.add(prefix[0]);
    });
    prefixes.forEach(p => {
      output += `${p}: ${PROGRAM_NOTE}\n`;
    });

    output += `\nTotal: ${total.toLocaleString()} VND\n`;
    output += `after: ${after.toLocaleString()} VND\n`;
    output += `b4: ${b4.toLocaleString()} VND`;
    if (b4 > 0) output += " --> đòi nợ TA";

    resultBox.value = output;
  });

  // giá SC
  function getSCPrice(pkg, rate) {
    if (rate.includes("D12") || rate.includes("DO")) {
      if (pkg === "RO") return 272000;
      if (pkg === "BB") return 376000;
      if (pkg === "BV01") return 1056000;
      return 904000;
    } else {
      if (pkg === "RO") return 0;
      if (pkg === "BB") return 392450;
      if (pkg === "BV01") return 1102200;
      return 943550;
    }
  }

  // giá EBA + phụ thu NL
  function getEBAPrice(pkg, rate) {
    if (rate.includes("D12") || rate.includes("DO")) {
      if (pkg === "RO") return 1144000;
      if (pkg === "BB") return 1248000;
      if (pkg === "BV01") return 1928000;
      return 1776000;
    } else {
      if (pkg === "RO") return 0;
      if (pkg === "BB") return 1302600;
      if (pkg === "BV01") return 2012350;
      return 1853700;
    }
  }
});