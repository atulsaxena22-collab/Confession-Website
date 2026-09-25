const confessionForm = document.getElementById("confessionForm");
const confessionInput = document.getElementById("confession");
const charCount = document.getElementById("charCount");
const successMessage = document.getElementById("successMessage");


/* Character Counter */

confessionInput.addEventListener("input", function () {
    charCount.textContent = confessionInput.value.length;
});


/* Submit Confession */

confessionForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const confession = confessionInput.value.trim();

    if (!confession) {
        alert("Please write your confession first.");
        return;
    }

    const submitButton = confessionForm.querySelector(".submit-btn");

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";


    try {

        const response = await fetch("/api/confessions", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name || "Anonymous",
                confession: confession
            })
        });


        const data = await response.json();


        if (response.ok) {

            confessionForm.style.display = "none";
            successMessage.style.display = "block";

            confessionForm.reset();
            charCount.textContent = "0";

        } else {

            alert(data.message || "Something went wrong.");

            submitButton.disabled = false;
            submitButton.textContent = "Send Confession 💌";
        }

    } catch (error) {

        console.error(error);

        alert("Server se connection nahi ho pa raha.");

        submitButton.disabled = false;
        submitButton.textContent = "Send Confession 💌";
    }

});


/* Write Another Confession */

function writeAnother() {

    successMessage.style.display = "none";
    confessionForm.style.display = "block";

    confessionForm.reset();
    charCount.textContent = "0";

}