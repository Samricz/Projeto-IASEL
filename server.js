import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";
import { systemPrompt } from "./selPrompt.js";

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const endpoint = process.env.OPENAI_ENDPOINT;
const deploymentName = process.env.OPENAI_DEPLOYMENT;
const apiKey = process.env.OPENAI_API_KEY;

if (!endpoint || !deploymentName || !apiKey) {
    console.error("Erro: verifique as informações do arquivo .env");
    process.exit(1);
}

const openai = new OpenAI({
    baseURL: endpoint,
    apiKey: apiKey
});

app.post("/chat", async (req, res) => {
    try {
        const { mensagem, previousResponseId } = req.body;

        if (
            typeof mensagem !== "string" ||
            mensagem.trim() === ""
        ) {
            return res.status(400).json({
                erro: "Digite uma mensagem para conversar com a SEL."
            });
        }

        const dadosRequisicao = {
            model: deploymentName,
            instructions: systemPrompt,
            input: mensagem.trim(),
            store: true
        };

        if (previousResponseId) {
            dadosRequisicao.previous_response_id = previousResponseId;
        }

        const response = await openai.responses.create(dadosRequisicao);

        res.json({
            response: response.output_text,
            responseId: response.id
        });
    } catch (erro) {
        console.error("Erro ao consultar a IA:", erro.message);

        res.status(500).json({
            erro: "A SEL não conseguiu responder. Tente novamente."
        });
    }
});


app.listen(port, () => {
    console.log(`Servidor da SEL rodando em http://localhost:${port}`);
});