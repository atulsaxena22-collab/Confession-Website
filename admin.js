const confessionsList = document.getElementById("confessionsList");

async function loadConfessions() {

    confessionsList.innerHTML = `
        <div class="loading">
            Loading confessions...
        </div>
    `;

    try {

        const response = await fetch("/api/confessions");

        if (!response.ok) {
            throw new Error("Failed to load confessions");
        }

        const confessions = await response.json();

        displayConfessions(confessions);

    } catch (error) {

        console.error(error);

        confessionsList.innerHTML = `
            <div class="empty-state">
                <h3>Could not load confessions</h3>
                <p>Server se data nahi aa raha.</p>
            </div>
        `;
    }
}


function displayConfessions(confessions) {

    if (confessions.length === 0) {

        confessionsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💭</div>
                <h3>No Confessions Yet</h3>
                <p>New confessions will appear here.</p>
            </div>
        `;

        return;
    }

    confessionsList.innerHTML = "";

    confessions
        .slice()
        .reverse()
        .forEach(confession => {

            const card = document.createElement("div");

            card.className = "confession-card";

            const date = new Date(confession.date);

            card.innerHTML = `
                <div class="confession-top">

                    <div class="person">

                        <div class="avatar">
                            💌
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(confession.name)}
                            </strong>

                            <small>
                                ${date.toLocaleString()}
                            </small>

                        </div>

                    </div>

                </div>

                <div class="confession-text">
                    ${escapeHTML(confession.confession)}
                </div>

                <div class="confession-actions">

                    <button onclick="copyConfession(${confession.id})">
                        📋 Copy
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteConfession(${confession.id})"
                    >
                        🗑 Delete
                    </button>

                </div>
            `;

            confessionsList.appendChild(card);
        });
}


async function copyConfession(id) {

    const response = await fetch("/api/confessions");

    const confessions = await response.json();

    const confession = confessions.find(
        item => item.id === id
    );

    if (!confession) return;

    const text =
        confession.name +
        "\n\n" +
        confession.confession;

    await navigator.clipboard.writeText(text);

    alert("Confession copied! 📋");
}


async function deleteConfession(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this confession?"
    );

    if (!confirmDelete) return;

    const response = await fetch(
        `/api/confessions/${id}`,
        {
            method: "DELETE"
        }
    );

    const data = await response.json();

    if (response.ok) {

        loadConfessions();

    } else {

        alert(
            data.message ||
            "Could not delete confession."
        );
    }
}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


loadConfessions();