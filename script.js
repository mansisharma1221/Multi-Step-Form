// Multi-Step Form with Validation, Summary & Web3Forms Submission
const steps = document.querySelectorAll(".form-step");
const sidebarSteps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

let currentStep = 0;

// Show the step at given index
function showStep(index) {
  steps.forEach((step, i) => step.classList.toggle("active", i === index));
  sidebarSteps.forEach((el, i) => el.classList.toggle("active", i === index));

  prevBtn.style.display = index === 0 ? "none" : "inline-block";
  nextBtn.style.display = index === steps.length - 1 ? "none" : "inline-block";
  nextBtn.textContent = index === steps.length - 2 ? "Confirm" : "Next Step";

  if (index === 3) updateSummary(); // Refresh summary on Step 4
}

// Handle next button click
nextBtn.addEventListener("click", () => {
  if (currentStep === 0 && !validateStep1()) return;

  if (currentStep < steps.length - 2) {
    currentStep++;
    showStep(currentStep);
  } else if (currentStep === steps.length - 2) {
    // On final step before submission, collect full data
    collectFormData();
    document.getElementById("multiStepForm").submit();
    currentStep++;
    showStep(currentStep);
  }
});

// Handle previous button
prevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
});

// Prevent sidebar skipping Step 1 without validation
sidebarSteps.forEach((stepEl, index) => {
  stepEl.addEventListener("click", () => {
    if (index === 0) {
      currentStep = index;
      showStep(currentStep);
    } else if (currentStep === 0) {
      if (validateStep1()) {
        currentStep = index;
        showStep(currentStep);
      }
    } else {
      currentStep = index;
      showStep(currentStep);
    }
  });
});

// Billing toggle: Monthly <-> Yearly
document.getElementById("billingToggle").addEventListener("change", (e) => {
  const yearly = e.target.checked;
  document.querySelectorAll(".plan-price").forEach((el, i) => {
    el.textContent = yearly
      ? ["$90/yr", "$120/yr", "$150/yr"][i]
      : ["$9/mo", "$12/mo", "$15/mo"][i];
  });

  document.querySelectorAll(".plan-offer").forEach((el) => {
    el.style.display = yearly ? "block" : "none";
  });
});

// Update summary content before confirmation
function updateSummary() {
  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  const billingYearly = document.getElementById("billingToggle").checked;

  const planName = selectedPlan
    .closest(".plan-card")
    .querySelector("h4").textContent;
  const planPrice = billingYearly
    ? { Arcade: 90, Advanced: 120, Pro: 150 }[planName]
    : { Arcade: 9, Advanced: 12, Pro: 15 }[planName];

  document.getElementById("summary-plan-name").textContent = `${planName} (${
    billingYearly ? "Yearly" : "Monthly"
  })`;
  document.getElementById("summary-plan-price").textContent = `$${planPrice}/${
    billingYearly ? "yr" : "mo"
  }`;
  document.getElementById("billing-type").textContent = billingYearly
    ? "year"
    : "month";

  const addons = document.querySelectorAll('input[name="addons[]"]:checked');
  const addonList = document.getElementById("summary-addons-list");
  addonList.innerHTML = "";

  let addonTotal = 0;

  addons.forEach((addon) => {
    const title = addon
      .closest(".addon-card")
      .querySelector(".addon-title").textContent;
    const price = billingYearly ? addon.dataset.yearly : addon.dataset.monthly;
    addonTotal += parseInt(price);
    addonList.innerHTML += `<div class="addon-summary"><span>${title}</span><span>+$${price}/${
      billingYearly ? "yr" : "mo"
    }</span></div>`;
  });

  const total = addonTotal + planPrice;
  document.getElementById("summary-total-price").textContent = `$${total}/${
    billingYearly ? "yr" : "mo"
  }`;
}

// Fill hidden inputs for Web3Forms before submission
function collectFormData() {
  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  const billingYearly = document.getElementById("billingToggle").checked;

  const planName = selectedPlan
    .closest(".plan-card")
    .querySelector("h4").textContent;
  const planPrice = billingYearly
    ? { Arcade: 90, Advanced: 120, Pro: 150 }[planName]
    : { Arcade: 9, Advanced: 12, Pro: 15 }[planName];
  const billingType = billingYearly ? "Yearly" : "Monthly";

  const planWithAmount = `${planName} - $${planPrice}/${
    billingYearly ? "yr" : "mo"
  }`;

  const addonTitles = Array.from(
    document.querySelectorAll('input[name="addons[]"]:checked')
  ).map((addon) => {
    const title = addon
      .closest(".addon-card")
      .querySelector(".addon-title").textContent;
    const price = billingYearly ? addon.dataset.yearly : addon.dataset.monthly;
    return `${title} - $${price}/${billingYearly ? "yr" : "mo"}`;
  });

  const total = document.getElementById("summary-total-price").textContent;

  // Fill hidden fields
  document.getElementById("form-plan").value = planWithAmount;
  document.getElementById("form-billing").value = billingType;
  document.getElementById("form-addons").value =
    addonTitles.length > 0 ? addonTitles.join(", ") : "None";
  document.getElementById("form-total").value = total;
}

// "Change" plan button
document.getElementById("changePlan").addEventListener("click", () => {
  currentStep = 1;
  showStep(currentStep);
});

// Validate Step 1 fields
function validateStep1() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name || !email || !phone) {
    alert("Please fill in all fields.");
    return false;
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValid) {
    alert("Invalid email.");
    return false;
  }

  const phoneValid = /^(\+?\d{1,4}[-\s]?)?\d{10,15}$/.test(phone);
  if (!phoneValid) {
    alert("Enter a valid phone number.");
    return false;
  }

  return true;
}

// Show the initial step
showStep(currentStep);
