
const form = document.getElementById("imageForm");
const imageInput = document.getElementById("image");
const qualityInput = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");
const compressBtn = document.getElementById("compressBtn");
const result = document.getElementById("result");
const message = document.getElementById("message");

const originalSizeElement = document.getElementById("originalSize");
const compressedSizeElement = document.getElementById("compressedSize");
const reductionElement = document.getElementById("reduction");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("downloadBtn");

let compressedImageUrl = null;

qualityInput.addEventListener("input", () => {
  qualityValue.textContent = qualityInput.value;
});

function formatSize(bytes) {
  return (bytes / 1024).toFixed(2) + " KB";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const image = imageInput.files[0];

  if (!image) {
    message.textContent = "Please select an image.";
    return;
  }

  const formData = new FormData();
  formData.append("image", image);
  formData.append("quality", qualityInput.value);

  compressBtn.disabled = true;
  compressBtn.textContent = "Compressing...";
  message.textContent = "";
  result.classList.add("hidden");

  try {
    const response = await fetch("/api/compress", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Compression failed.");
    }

    const compressedBlob = await response.blob();

    const originalSize = Number(
      response.headers.get("X-Original-Size")
    );

    const compressedSize = compressedBlob.size;

    if (compressedImageUrl) {
      URL.revokeObjectURL(compressedImageUrl);
    }

    compressedImageUrl = URL.createObjectURL(compressedBlob);

    originalSizeElement.textContent = formatSize(originalSize);
    compressedSizeElement.textContent = formatSize(compressedSize);

    const percentage =
      ((originalSize - compressedSize) / originalSize) * 100;

    reductionElement.textContent =
      percentage.toFixed(2) + "%";

    preview.src = compressedImageUrl;
    downloadBtn.href = compressedImageUrl;
    downloadBtn.download = "compressed-image.jpg";

    result.classList.remove("hidden");
  } catch (error) {
    message.textContent = error.message;
    console.error(error);
  } finally {
    compressBtn.disabled = false;
    compressBtn.textContent = "Reduce Image Size";
  }
});
