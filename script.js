let shields = JSON.parse(localStorage.getItem("shields")) || [];

function displayShields() {
    const gallery = document.getElementById("shieldGallery");
    if (!gallery) return;

    gallery.innerHTML = "";

    shields.forEach((shield, index) => {
        const div = document.createElement("div");
        div.className = "shield";
        div.innerHTML = `
            <img src="${shield.image}">
            <h4>${shield.code}</h4>
            <p>By: ${shield.creator}</p>
            <button onclick="copyCode(${index})">Copy Code</button>
            <button class="delete-btn" onclick="deleteShield(${index})">Delete</button>
        `;
        gallery.appendChild(div);
    });
}

function deleteShield(index) {
    const shield = shields[index];
    const userKey = prompt("Enter the Secret Key to delete this shield:");

    if (userKey === shield.secretKey) {
        if (confirm("Are you sure you want to delete this?")) {
            shields.splice(index, 1);
            localStorage.setItem("shields", JSON.stringify(shields));
            displayShields();
            alert("Shield deleted.");
        }
    } else {
        alert("Incorrect Secret Key. You cannot delete this shield.");
    }
}

function uploadShield() {
    const creator = document.getElementById("creator").value.trim();
    const code = document.getElementById("code").value.trim();
    const secretKey = document.getElementById("secretKey").value.trim(); // New field
    const fileInput = document.getElementById("image");
    const file = fileInput.files[0];

    if (!creator || !code || !secretKey || !file) {
        alert("Please fill in all fields and select an image.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function() {
        const shield = {
            creator,
            code,
            secretKey, // Saving the key with the shield
            image: reader.result
        };

        shields.push(shield);
        localStorage.setItem("shields", JSON.stringify(shields));

        alert("Shield uploaded!");

        // Reset fields
        document.getElementById("creator").value = "";
        document.getElementById("code").value = "";
        document.getElementById("secretKey").value = "";
        fileInput.value = "";
    }
    reader.readAsDataURL(file);
}

function copyCode(index) {
    const text = shields[index].code;
    navigator.clipboard.writeText(text).then(() => alert("Code copied!"));
}

displayShields();