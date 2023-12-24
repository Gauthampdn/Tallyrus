const OpenAI = require('openai');
require("dotenv").config();



const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



const completion = async (req, res) => {
    try {
        const prompt = req.body.prompt;

        console.log("prompt is " + prompt)

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: prompt
        });

        
        res.json(response);
    } catch (error) {
        res.status(500).send('Error with OpenAI request');
    }
};



const test = async (req, res) => {
    try {
        const promptText = "Give a simple markdown file example";
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": "You are a helpful assistant." },
                { "role": "user", "content": "Hello how are you!" }
            ]
        });



        res.json(response);
    } catch (error) {
        console.error("Error with OpenAI request:", error);
        res.status(500).send('Error with OpenAI request');
    }
};


module.exports = {
    completion,
    test
}