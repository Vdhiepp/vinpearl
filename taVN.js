const roomPriceInput = document.getElementById("roomPrice");
const scPriceInput = document.getElementById("scPrice");
const ebaPriceInput = document.getElementById("ebaPrice");

document.getElementById("btnSC").onclick = () => {
    scPriceInput.classList.toggle("hidden");
};

document.getElementById("btnEBA").onclick = () => {
    ebaPriceInput.classList.toggle("hidden");
};

function formatNumber(input) {
    let raw = input.value.replace(/,/g, "");
    if (!isNaN(raw) && raw !== "") {
        input.value = Number(raw).toLocaleString("en-US");
    }
}

roomPriceInput.oninput = () => formatNumber(roomPriceInput);
scPriceInput.oninput = () => formatNumber(scPriceInput);
ebaPriceInput.oninput = () => formatNumber(ebaPriceInput);

function getNumber(val) {
    return Number(val.replace(/,/g, ""));
}

function calculate() {
    const rateCode = document.getElementById("rateCode").value.toUpperCase();
    const roomPrice = getNumber(roomPriceInput.value);
    let output = "";

    const afterText =
        rateCode.endsWith("DO") || rateCode.endsWith("D12")
            ? "to TA after C/o"
            : "to TA b4 C/I";

    let meal = "";
    if (rateCode.includes("RO")) meal = "RO";
    if (rateCode.includes("BB")) meal = "BB";
    if (rateCode.includes("BV")) meal = "BV";

    let scText = "";
    if (!scPriceInput.classList.contains("hidden")) {
        const scValue = getNumber(scPriceInput.value) - roomPrice;
        scText = `SC (${scValue.toLocaleString()} VND/TE/N)`;
    }

    let ebaText = "";
    if (!ebaPriceInput.classList.contains("hidden")) {
        const ebaValue = getNumber(ebaPriceInput.value) - roomPrice;
        ebaText = `EBA (${ebaValue.toLocaleString()} VND/NL/N)`;
    }

    output += `RM (${roomPrice.toLocaleString()} VND/P/D)`;

    if (meal) output += ` + ${meal}`;
    if (scText) output += ` + ${scText}`;
    if (ebaText) output += ` + ${ebaText}`;

    output += ` ${afterText}\n`;
    output += `Xtra to POA\n`;

    if (rateCode.includes("PR33003")) {
        output += `PR33003: THU SO COOL + Tặng 01 lần trải nghiệm Aquafield cho toàn bộ khách/phòng GỒM CÁP TREO 02 chiều\n`;
    }

    if (rateCode.includes("PR33004")) {
        output += `PR33004 (KHÔNG EB): THU SO COOL + FOC 2 KIDS FOR BB PACKAGE - Miễn phí 2 trẻ em dưới 12 tuổi gói BB\n`;
    }

    document.getElementById("output").innerText = output;
}
