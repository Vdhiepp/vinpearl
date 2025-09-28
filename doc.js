async function loadContent(file) {
  const response = await fetch("content/" + file);
  const text = await response.text();
  document.getElementById("mainContent").innerHTML = text;
}
