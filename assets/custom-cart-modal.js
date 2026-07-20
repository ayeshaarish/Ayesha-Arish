document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("CustomCartModal");
  if (!modal) return;

  const overlay = modal.querySelector(".custom-cart-modal__overlay");
  const closeBtn = modal.querySelector(".custom-cart-modal__close");

  const image = document.getElementById("CustomCartImage");
  const title = document.getElementById("CustomCartTitle");
  const price = document.getElementById("CustomCartPrice");
  const description = document.getElementById("CustomCartDescription");

  const colorWrapper = document.getElementById("CustomCartColorWrapper");
  const colorsContainer = document.getElementById("CustomCartColors");

  const sizeWrapper = document.getElementById("CustomCartSizeWrapper");
  const sizeSelect = document.getElementById("CustomCartSizes");

  const qtyInput = document.getElementById("CustomCartQty");
  const qtyMinus = document.getElementById("CustomCartQtyMinus");
  const qtyPlus = document.getElementById("CustomCartQtyPlus");

  const addButton = document.getElementById("CustomCartButton");

  let product = null;
  let selectedVariant = null;
  let selectedColor = "";
  let selectedSize = "";

  function formatMoney(price) {
    return "$" + (price / 100).toFixed(2);
  }

  function openModal() {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  overlay.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  qtyMinus.addEventListener("click", () => {
    let qty = parseInt(qtyInput.value) || 1;
    if (qty > 1) qty--;
    qtyInput.value = qty;
  });

  qtyPlus.addEventListener("click", () => {
    let qty = parseInt(qtyInput.value) || 1;
    qty++;
    qtyInput.value = qty;
  });

  document.querySelectorAll(".featured-product-card__cart").forEach((button) => {

    button.addEventListener("click", async () => {

      const handle = button.dataset.productHandle;

      if (!handle) return;

      try {

        const response = await fetch(`/products/${handle}.js`);

        product = await response.json();

        selectedVariant = product.variants[0];

        image.src = product.featured_image;
        image.alt = product.title;

        title.textContent = product.title;

        price.textContent = formatMoney(selectedVariant.price);

        description.innerHTML = product.description || "";

        colorsContainer.innerHTML = "";

        sizeSelect.innerHTML =
          '<option value="">Choose your size</option>';

        colorWrapper.style.display = "none";
        sizeWrapper.style.display = "none";

        product.options.forEach((option, index) => {

          const values = [...new Set(product.variants.map(v => v.options[index]))];

          if (option.name.toLowerCase() === "color") {

            colorWrapper.style.display = "block";

            values.forEach(value => {

              const swatch = document.createElement("button");

              swatch.type = "button";
              swatch.className = "custom-cart-modal__color";
              swatch.dataset.value = value;
              swatch.title = value;

              swatch.style.backgroundColor = value.toLowerCase();

              colorsContainer.appendChild(swatch);

            });

          }

          if (option.name.toLowerCase() === "size") {

            sizeWrapper.style.display = "block";

            values.forEach(value => {

              const optionElement = document.createElement("option");

              optionElement.value = value;
              optionElement.textContent = value;

              sizeSelect.appendChild(optionElement);

            });

          }

        });

        openModal();

      } catch (error) {

        console.error("Product loading failed:", error);

      }

    });

  });

  function updateVariant() {

    if (!product) return;

    selectedVariant = product.variants.find((variant) => {

      let colorMatch = true;
      let sizeMatch = true;

      product.options.forEach((option, index) => {

        if (option.name.toLowerCase() === "color" && selectedColor) {
          colorMatch = variant.options[index] === selectedColor;
        }

        if (option.name.toLowerCase() === "size" && selectedSize) {
          sizeMatch = variant.options[index] === selectedSize;
        }

      });

      return colorMatch && sizeMatch;

    });

    if (!selectedVariant) return;

    price.textContent = formatMoney(selectedVariant.price);

  }

  colorsContainer.addEventListener("click", (e) => {

    if (!e.target.classList.contains("custom-cart-modal__color")) return;

    colorsContainer
      .querySelectorAll(".custom-cart-modal__color")
      .forEach(item => item.classList.remove("active"));

    e.target.classList.add("active");

    selectedColor = e.target.dataset.value;

    updateVariant();

  });

  sizeSelect.addEventListener("change", () => {

    selectedSize = sizeSelect.value;

    updateVariant();

  });

  addButton.addEventListener("click", async () => {

    if (!selectedVariant) {

      alert("Please select a variant.");

      return;

    }

    addButton.disabled = true;

    const originalText = addButton.innerHTML;

    addButton.innerHTML = "Adding...";

    try {

      const response = await fetch("/cart/add.js", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          id: selectedVariant.id,

          quantity: parseInt(qtyInput.value)

        })

      });

      if (!response.ok) {

        throw new Error("Unable to add product");

      }

      addButton.innerHTML = "Added ✓";

      closeModal();

      /* Refresh Dawn cart */

      if (window.fetch) {

        fetch("/cart.js")
          .then(res => res.json())
          .then(() => {

            document.dispatchEvent(
              new CustomEvent("cart:refresh", {
                bubbles: true
              })
            );

          });

      }

    } catch (error) {

      console.error(error);

      addButton.innerHTML = "Error";

    }

    setTimeout(() => {

      addButton.innerHTML = originalText;

      addButton.disabled = false;

    }, 1500);

  });

});