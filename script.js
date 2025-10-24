

  (function(){
  emailjs.init("trmwH35f9Bvxmh5i-"); // Replace with your EmailJS public key
})();

let selectedProduct = '';
let selectedPrice = 0;
let orderCart = [];

// ==========================
// PHONE NUMBER VALIDATION (LOCAL + ONLINE READY)
// ==========================
function isValidSouthAfricanNumber(phone) {
  const cleaned = phone.replace(/\s+/g, '');
  const saPattern = /^(?:\+27|0)[6-8][0-9]{8}$/; // Matches 060–089 numbers
  return saPattern.test(cleaned);
}

// Optional: Real verification (using API like Numverify or Twilio Lookup)
async function verifyPhoneNumberExists(phone) {
  const accessKey = "e024afb5191462ab61fe5245cd1f9be2"; 
  try {
    const response = await fetch(`https://apilayer.net/api/validate?access_key=${accessKey}&number=${phone}&country_code=ZA&format=1`);
    const data = await response.json();
    return data.valid; // true if number exists
  } catch (error) {
    console.error("Phone verification error:", error);
    return false;
  }
}

// ==========================
// ORDER FUNCTIONS
// ==========================
function orderNow(product, price) {
  selectedProduct = product;
  selectedPrice = price;

  document.getElementById("order-item").innerText = 
    `You are ordering: ${product} (R${price})`;
  document.getElementById("order-popup").style.display = "flex";

  // Reset bed size selection, details, and drawer checkbox
  const bedSizeSelect = document.getElementById('bedSize');
  if(bedSizeSelect){
    bedSizeSelect.value = '';
    document.getElementById('bedDetails').innerHTML = '';
  }

  // Show drawer option only for headboards
  const drawerOption = document.getElementById('drawerOption');
  if (product.toLowerCase().includes("headboard")) {
    drawerOption.style.display = "block";
    document.getElementById('addDrawers').checked = false;
  } else {
    drawerOption.style.display = "none";
  }
}

function closeOrderPopup() {
  document.getElementById('order-popup').style.display = 'none';
}

function closeOrder() {
  document.getElementById("order-popup").style.display = "none";
}

// Show bed size dimensions and update price
function showBedSizeDetails() {
  const size = document.getElementById('bedSize').value;
  const details = document.getElementById('bedDetails');

  const baseBeds = {
    Single: { width: "90 cm", length: "187 cm", height: "40 cm", price: 800 },
    Double: { width: "137 cm", length: "187 cm", height: "40 cm", price: 1000 },
    Queen: { width: "152 cm", length: "187 cm", height: "40 cm", price: 1200 },
    King: { width: "175 cm", length: "187 cm", height: "40 cm", price: 1500 }
  };

  const headboards = {
    Single: { width: "90 cm", height: "120 cm", price: 1200 },
    Double: { width: "137 cm", height: "120 cm", price: 1500 },
    Queen: { width: "152 cm", height: "120 cm", price: 1700 },
    King: { width: "175 cm", height: "120 cm", price: 2000 }
  };

  const isHeadboard = selectedProduct.toLowerCase().includes("headboard");
  const sizes = isHeadboard ? headboards : baseBeds;

  if (size && sizes[size]) {
    let dim = sizes[size];
    selectedPrice = dim.price;

    if (isHeadboard) {
      const addDrawers = document.getElementById('addDrawers');
      if (addDrawers && addDrawers.checked) selectedPrice += 600;
    }

    const dimStr = isHeadboard 
      ? `Width: ${dim.width} | Height: ${dim.height}`
      : `Width: ${dim.width} | Length: ${dim.length} | Height: ${dim.height}`;

    details.innerHTML = `📏 <strong>${size}</strong> Size:<br>${dimStr}<br>💰 Price: R${selectedPrice}`;
    document.getElementById("order-item").innerText = 
      `You are ordering: ${selectedProduct} (${size}) - R${selectedPrice}`;
  } else {
    details.innerHTML = "";
  }
}

// ==========================
// SINGLE ORDER SUBMISSION
// ==========================
document.getElementById("orderForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const phone = document.getElementById("phone").value.trim();
  const bedSize = document.getElementById("bedSize").value;
  const addDrawers = document.getElementById("addDrawers").checked;

  // ✅ Step 1: Validate local phone number format
  if (!isValidSouthAfricanNumber(phone)) {
    alert("⚠️ Please enter a valid South African phone number before proceeding.");
    return;
  }

  // ✅ Step 2 (optional): Verify if the number really exists (enable when API key is added)
  // const exists = await verifyPhoneNumberExists(phone);
  // if (!exists) {
  //   alert("❌ This phone number does not exist. Please double-check before submitting.");
  //   return;
  // }

  let sizeMessage = bedSize ? `%0A🛏️ Size: ${bedSize}` : '';
  if (addDrawers) sizeMessage += ` + Side Drawers`;

  const message = `🛏️ *New Order*%0A--------------------%0A👤 Name: ${name}%0A📦 Product: ${selectedProduct}%0A💰 Price: R${selectedPrice}${sizeMessage}%0A📍 Address: ${address}%0A📞 Phone: ${phone}`;

  const whatsappNumber = "27634879062";
  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");

  emailjs.send("service_ib2fsui", "template_2r6m88p", {
    user_name: name,
    user_product: selectedProduct,
    user_address: address,
    user_phone: phone,
    user_price: selectedPrice,
    user_bedsize: bedSize || "N/A",
    user_drawers: addDrawers ? "Yes" : "No",
    to_email: "teesetsomaatlane33@gmail.com"
  })
  .then(() => {
    alert("✅ Order confirmed! You’ll receive a WhatsApp message and email confirmation shortly.");
    closeOrder();
  })
  .catch(() => {
    alert("❌ Email not sent. Please contact us directly via WhatsApp.");
  });
});

// ==========================
// CART / MULTIPLE ORDER FUNCTIONS
// ==========================
function updateCartCounter() {
  document.getElementById("cart-count").innerText = orderCart.length;
}

function addToCart() {
  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const bedSize = document.getElementById("bedSize").value;
  const addDrawers = document.getElementById("addDrawers").checked;

  if (!name || !address || !phone) {
    alert("⚠️ Please fill in your details first before adding to cart.");
    return;
  }

  if (!isValidSouthAfricanNumber(phone)) {
    alert("⚠️ Please enter a valid South African phone number before adding to cart.");
    return;
  }

  orderCart.push({
    product: selectedProduct,
    price: selectedPrice,
    size: bedSize || "N/A",
    drawers: addDrawers ? "Yes" : "No"
  });

  alert(`${selectedProduct} added to your order list.`);
  closeOrder();
  updateCartCounter();
}

function viewCart() {
  const cartList = document.getElementById("cart-items");
  cartList.innerHTML = ""; 

  if (orderCart.length === 0) {
    cartList.innerHTML = "<li>Your cart is empty.</li>";
  } else {
    orderCart.forEach((item, i) => {
      const li = document.createElement("li");
      li.innerHTML = `${i + 1}. ${item.product} (${item.size}) - R${item.price} | Drawers: ${item.drawers} 
        <button onclick="removeCartItem(${i})" style="margin-left:5px;">❌ Remove</button>`;
      cartList.appendChild(li);
    });
  }

  document.getElementById("cart-popup").style.display = "flex";
  updateCartCounter();
}

function removeCartItem(index) {
  orderCart.splice(index, 1);
  viewCart();
}

function closeCart() {
  document.getElementById("cart-popup").style.display = "none";
}

function clearCart() {
  if (confirm("⚠️ Are you sure you want to clear the cart?")) {
    orderCart = [];
    closeCart();
    updateCartCounter();
  }
}

function confirmCartOrder() {
  if (orderCart.length === 0) {
    alert("🛒 Your cart is empty.");
    closeCart();
    return;
  }

  const name = prompt("Enter your full name:");
  const phone = prompt("Enter your phone number:");
  const address = prompt("Enter your delivery address:");

  if (!name || !phone || !address) {
    alert("Please provide all details to send your order.");
    return;
  }

  if (!isValidSouthAfricanNumber(phone)) {
    alert("⚠️ Invalid South African phone number.");
    return;
  }

  let orderText = "🛒 *New Multiple Order*\n---------------------\n";
  orderCart.forEach((item, i) => {
    orderText += `${i + 1}. ${item.product} (${item.size}) - R${item.price}\nDrawers: ${item.drawers}\n\n`;
  });
  orderText += `---------------------\n👤 Name: ${name}\n📍 Address: ${address}\n📞 Phone: ${phone}`;

  const whatsappNumber = "27634879062";
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderText)}`, "_blank");

  emailjs.send("service_ib2fsui", "template_2r6m88p", {
    user_name: name,
    user_phone: phone,
    user_address: address,
    user_message: orderText
  })
  .then(() => {
    alert("✅ Your complete order list has been sent!");
    orderCart = [];
    closeCart();
    updateCartCounter();
  })
  .catch(() => {
    alert("❌ Failed to send via email. Please contact via WhatsApp.");
  });
}

// ==========================
// MAKE FUNCTIONS GLOBALLY ACCESSIBLE
// ==========================
window.orderNow = orderNow;
window.closeOrderPopup = closeOrderPopup;
window.showBedSizeDetails = showBedSizeDetails;
window.addToCart = addToCart;
window.viewCart = viewCart;
window.removeCartItem = removeCartItem;
window.clearCart = clearCart;
window.confirmCartOrder = confirmCartOrder;
window.updateCartCounter = updateCartCounter;
