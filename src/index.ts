import express from "express";
import { join } from "path";
import fs from "fs/promises";
import {createReadStream} from "fs";
import {config as dotenv_config} from "dotenv";
import moment from "moment";
dotenv_config();

declare global {
    namespace NodeJS {
        export interface ProcessEnv {
            VIDEO_PATH: string;
            NODE_ENV: "development" | "production";
            CHUNK_EXPONENT : string;
        }
    }
}

const chunkExponent = process.env.CHUNK_EXPONENT ? Number.parseInt(process.env.CHUNK_EXPONENT) : 6;
const CHUNK_SIZE = Math.pow(10, chunkExponent);
console.log(`CHUNK_SIZE <${CHUNK_SIZE}> (10^${chunkExponent})`);
const DATADIR = process.env.VIDEO_PATH || "/data";
console.log(`DATADIR <${DATADIR}>`);

// create app
const app = express();
app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production" && !req.secure) {
        const redirectUrl = `https://${req.headers.host}${req.originalUrl}`;
        console.log(`User is not using TLS - redirecting user to ${redirectUrl}`);
        res.redirect(redirectUrl);
    } else {
        next();
    }
})

app.get("/:strdate([0-9]{4}-[0-9]{2}-[0-9]{2})?", function (req, res) {
    res.sendFile(join(__dirname, "..", "index.html"));
});

app.get("/videos/:date", async (req, res) => {
    // get date as string
    const strdate = req.params.date;

    // parse and adjust to monday
    let m = moment(`${strdate}T00:00:00`, "YYYY-MM-DD[T]HH:mm:ss");
    const dateStrDay = `${m.year()}${m.month() + 1}${m.date() < 10 ? "0" + m.date() : m.date()}`;
    const dateStrMonth = `${m.year()}${m.month() + 1}`;
    while (m.day() !== 1) {
        m = m.subtract(1, "days");
    }
    const dateStrWeekStart = `${m.year()}${m.month()+1}${m.date() < 10 ? "0" + m.date() : m.date()}`;

    // filter files
    const files = (await fs.readdir(DATADIR)).filter((file) => {
        return file.toLowerCase().endsWith(".mp4");
    }).filter(file => {
        return file === `timelapse-day-${dateStrDay}.mp4` || file.startsWith(`timelapse-week-${dateStrWeekStart}`) || file.startsWith(`timelapse-month-${dateStrMonth}`);
    });

    // send response
    res.type("json");
    res.send({
        files,
    });
});

app.get("/video/:file", async (req, res) => {
    // Ensure there is a range given for the video
    const range = req.headers.range as string;
    if (!range || !range.length) {
        res.status(400).send("Requires Range header");
    }

    const videoPath = join(DATADIR, req.params.file);
    const videoSize = (await fs.stat(videoPath)).size;
    if ("bytes=0-1" === range) {
        var start = 0;
        var end = 1;
    }  else {
        const matches = range.match(/bytes=(\d+)-(\d+)/);
        if (matches) {
            var start = Number.parseInt(matches[1]);
            var end = Number.parseInt(matches[2]);
        } else {
            var start = Number(range.replace(/\D/g, ""));
            var end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        }
    }

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(res);
});

app.listen(process.env.PORT || 8080, function () {
    console.log(`Listening on port ${process.env.PORT || 8080}`);
});
