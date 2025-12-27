// Load the shared footer HTML file and inject it into the page
fetch("footer.html")
  // Convert the response into plain text (HTML markup)
  .then((res) => res.text())
  // Insert the footer HTML into the placeholder element
  .then((html) => {
    document.getElementById("footer-placeholder").innerHTML = html;
  })
  // Handle errors (e.g., file not found or network issue)
  .catch((err) => console.error("Failed to load footer:", err));
