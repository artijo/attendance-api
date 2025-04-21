import { LINE_ENDPOINT } from "../config.js";
import axios from "axios";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

export async function pushMessageToLine(userId, message) {
    const url = `${LINE_ENDPOINT}/message/push`;
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    };
    const data = {
        to: userId,
        messages: [
            {
                type: "text",
                text: message,
            },
        ],
    };
    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        console.error("Error sending message to LINE:", error.response.data);
        throw error;
    }
}