require("dotenv").config();
const { App } = require("@slack/bolt");
const axios = require("axios");

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
});

app.command("/confusion-help",async ({ack, respond}) => {
    await ack();
    await respond({
        text: `Available Commands:
    /confusion-ping - Check bot latency
    /confusion-music - Get a random music recommendation
    /confusion-catfact - Get a cat fact
    /confusion-trivia - Get a trivia question
    /confusion-joke - Get a fun joke
    /confusion-qotd - Get a quote of the day
    /confusion-8ball - Ask the magic 8 ball a question
    /confusion-search <query>- Search the web for a query
    /confusion-remind <task> <time> - Set a reminder for a task at a specific time`
    });
});

app.command("/confusion-qotd", async ({ ack, respond }) => {
    await ack();
    try {
        const response = await axios.get("https://api.quotable.io/random");
        await respond({ text: `Quote of the Day: "${response.data.content}" - ${response.data.author}` });
    } catch (error) {
        await respond({ text: "Failed to fetch a quote." });
    }
});

app.command("/confusion-music", async ({ ack, respond }) => {
    await ack();
    try {
        const response = await axios.get("https://api.deezer.com/chart/0/tracks");
        const tracks = response.data.data;
        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
        await respond({ text: `Music Recommendation: "${randomTrack.title}" by ${randomTrack.artist.name}\nListen here: ${randomTrack.link}` });
    } catch (error) {
        await respond({ text: "Failed to fetch a music recommendation." });
    }
});

app.command("/confusion-8ball", async ({ command, ack, respond }) => {
    await ack();
    const responses = [
        "It is certain.",
        "Without a doubt.",
        "You may rely on it.",
        "Yes, definitely.",
        "As I see it, yes.",
        "Most likely.",
        "Outlook good.",
        "Yes.",
        "Signs point to yes.",
        "Reply hazy, try again.",
        "Ask again later.",
        "Better not tell you now.",
        "Cannot predict now.",
        "Concentrate and ask again.",
        "Don't count on it.",
        "My reply is no.",
        "My sources say no.",
        "Outlook not so good.",
        "Very doubtful."
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    await respond({ text: `Magic 8 Ball says: ${randomResponse}` });
});

app.command("/confusion-search", async ({ command, ack, respond }) => {
    await ack();
    const query = command.text;
    if (!query) {
        await respond({ text: "Please provide a search query." });
        return;
    }
    try {
        const response = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
        const result = response.data.AbstractText || "No results found.";
        await respond({ text: `Search Results for "${query}": ${result}` });
    } catch (error) {
        await respond({ text: "Failed to perform the search." });
    }
});

app.command("/confusion-remind", async ({ command, ack, respond }) => {
    await ack();
    const [task, time] = command.text.split(" ");
    if (!task || !time) {
        await respond({ text: "Please provide a task and a time (in seconds)." });
        return;
    }
    const timeInMs = parseInt(time) * 1000;
    if (isNaN(timeInMs)) {
        await respond({ text: "Invalid time format. Please provide time in seconds." });
        return;
    }
    setTimeout(async () => {
        await respond({ text: `Reminder: ${task}` });
    }, timeInMs);
    await respond({ text: `Reminder set for "${task}" in ${time} seconds.` });
});

app.command("/confusion-trivia", async ({ ack, respond }) => {
    await ack();
    try {
        const response = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple");
        const trivia = response.data.results[0];
        const question = trivia.question;
        const correctAnswer = trivia.correct_answer;
        const incorrectAnswers = trivia.incorrect_answers;
        const allAnswers = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5);
        await respond({
            text: `Trivia Question: ${question}\nOptions: ${allAnswers.join(", ")}\nCorrect Answer: ${correctAnswer}`
        });
    } catch (error) {
        await respond({ text: "Failed to fetch a trivia question." });
    }
});

app.command("/confusion-catfact", async ({ ack, respond }) => {
    await ack();
    try {
        const response = await axios.get("https://catfact.ninja/fact");
        await respond({ text: `Cat Fact: ${response.data.fact}` });
    } catch (error) {
        await respond({ text: "Failed to fetch a cat fact." });
    }
});

app.command("/confusion-joke",async ({ ack, respond }) => {
    await ack();
    try {
        const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
        await respond({ text: `Joke: ${response.data.setup} - ${response.data.punchline}` });
    } catch (error) {
        await respond({ text: "Failed to fetch a joke." });
    }
})

app.command("/confusion-ping", async ({ command, ack, respond }) => {
    const start = Date.now();
    await ack();
    const latency = Date.now() - start;
    await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

(async () => {
    await app.start();
    console.log("bot is running!");
})();
