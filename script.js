import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2lSF54AkJkFxDqtMz12_DbuEA6ky7IMw",
  authDomain: "graal-shield-hub.firebaseapp.com",
  projectId: "graal-shield-hub",
  storageBucket: "graal-shield-hub.firebasestorage.app",
  messagingSenderId: "175382116983",
  appId: "1:175382116983:web:21e954e7625c54de70a472",
  measurementId: "G-Q9CND5YT58"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const shieldCol = collection(db, "shields");

async function displayShields() {
    const gallery = document.getElementById("shieldGallery");
    if (!gallery) return;
    
    gallery.innerHTML = "<p style='font-size:10px; color:#50fa7b;'>SYNCING WITH DATABASE...</p>";
    
    try {
        const q = query(shieldCol, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        gallery.innerHTML = "";
        
        querySnapshot.forEach((docSnap) => { // Renamed from 'document' to fix the crash
            const shield = docSnap.data();
            const id = docSnap.id;

            const div = document.createElement("div");
            div.className = "shield";
            div.innerHTML = `
                <img src="${shield.image}">
                <h4>${shield.code}</h4>
                <p>DESIGNED BY: ${shield.creator}</p>
                <button onclick="window.copyText('${shield.code}')">COPY CODE</button>
                <button class="delete-btn" onclick="window.deleteShield('${id}', '${shield.secretKey}')">DELETE</button>
            `;
            gallery.appendChild(div);
        });
    } catch (e) {
        gallery.innerHTML = "<p>Error loading shields. Check Firebase rules or Console.</p>";
        console.error("Firebase Error:", e);
    }
}

window.uploadShield = async function() {
    const creator = document.getElementById("creator").value.trim();
    const code = document.getElementById("code").value.trim();
    const secretKey = document.getElementById("secretKey").value.trim();
    const fileInput = document.getElementById("image");
    const file = fileInput.files[0];

    if (!creator || !code || !secretKey || !file) {
        alert("CRITICAL: All fields required.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async function() {
        try {
            await addDoc(shieldCol, {
                creator: creator,
                code: code,
                secretKey: secretKey,
                image: reader.result,
                timestamp: Date.now()
            });
            alert("SUCCESS: Shield deployed to Global Hub!");
            window.location.href = "index.html";
        } catch (e) {
            alert("UPLOAD FAILED: Check your Firestore Rules.");
            console.error(e);
        }
    }
    reader.readAsDataURL(file);
}

window.deleteShield = async function(id, correctKey) {
    const userKey = prompt("SECURITY: Enter Secret Key to delete this asset:");
    if (userKey === correctKey) {
        if (confirm("Permanently delete this shield from the hub?")) {
            await deleteDoc(doc(db, "shields", id));
            alert("DELETED.");
            displayShields();
        }
    } else {
        alert("ACCESS DENIED: Incorrect Secret Key.");
    }
}

window.copyText = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        alert("CODE COPIED: " + text);
    }).catch(err => {
        // Fallback for older browsers
        const temp = document.createElement("input");
        document.body.appendChild(temp);
        temp.value = text;
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
        alert("CODE COPIED: " + text);
    });
}

displayShields();