document.addEventListener("DOMContentLoaded", function () {
  // Product detail page: Image thumbnail switcher
  const mainImage = document.getElementById("main-product-image");
  const thumbnails = document.querySelectorAll(".thumbnail");

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      // Get the full-size image URL from the thumbnail's src
      // This assumes the large image has a different suffix, e.g., _1024x1024
      const newImageSrc = this.src.replace("_100x.", "_1024x1024.");
      mainImage.src = newImageSrc;

      // Update active state for thumbnail
      document.querySelector(".thumbnail.active").classList.remove("active");
      this.classList.add("active");
    });
  });

  // Cart page: basic remove functionality (for demonstration)
  const removeButtons = document.querySelectorAll(".remove-item");
  removeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Find the parent .cart-item and remove it
      this.closest(".cart-item").remove();
      // In a real application, you would also update the cart totals here
      alert("Item removed. (Demo)");
    });
  });
});
