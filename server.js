const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "confessions.json");


/* ================= MIDDLEWARE ================= */

app.use(express.json());

app.use(express.static(__dirname));


/* ================= FILE SETUP ================= */

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]");
}


/* ================= FUNCTIONS ================= */

function readConfessions() {

    try {

        const data =
            fs.readFileSync(DATA_FILE, "utf8");

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Error reading confessions:",
            error
        );

        return [];

    }
}


function saveConfessions(confessions) {

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(confessions, null, 2)
    );

}


/* ================= SUBMIT CONFESSION ================= */

app.post("/api/confessions", (req, res) => {

    const { name, confession } = req.body;


    if (
        !confession ||
        confession.trim() === ""
    ) {

        return res.status(400).json({

            message:
                "Confession cannot be empty."

        });

    }


    const confessions =
        readConfessions();


    const newConfession = {

        id: Date.now(),

        name:
            name && name.trim()
                ? name.trim()
                : "Anonymous",

        confession:
            confession.trim(),

        date:
            new Date().toISOString()

    };


    confessions.push(newConfession);

    saveConfessions(confessions);


    res.status(201).json({

        message:
            "Confession submitted successfully."

    });

});


/* ================= GET ALL CONFESSIONS ================= */

app.get("/api/confessions", (req, res) => {

    const confessions =
        readConfessions();

    res.json(confessions);

});


/* ================= DELETE CONFESSION ================= */

app.delete("/api/confessions/:id", (req, res) => {

    const id =
        Number(req.params.id);


    const confessions =
        readConfessions();


    const updatedConfessions =
        confessions.filter(
            confession =>
                confession.id !== id
        );


    if (
        updatedConfessions.length ===
        confessions.length
    ) {

        return res.status(404).json({

            message:
                "Confession not found."

        });

    }


    saveConfessions(
        updatedConfessions
    );


    res.json({

        message:
            "Confession deleted successfully."

    });

});


/* ================= TEST ================= */

app.get("/api/test", (req, res) => {

    res.json({

        message:
            "Confession Server is Working!"

    });

});


/* ================= HOME ================= */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

});


/* ================= SERVER ================= */

app.listen(PORT, () => {

    console.log(
        `Confession Website running at http://localhost:${PORT}`
    );

});