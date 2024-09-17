import {useEffect, useState, ChangeEvent, KeyboardEvent, FC} from 'react';

interface Message {
    from: string;
    messageText: string;
}

const Chat: FC = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');

    const userId = 'user';
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;

    useEffect(() => {
        // Initialize WebSocket connection
        let ws: WebSocket;

        const initWebSocket = () => {
            ws = new WebSocket(wsUrl, 'echo-protocol');
            setSocket(ws);

            ws.onopen = () => {
                console.log('Connected to WebSocket server');
                ws.send(JSON.stringify({ action: 'connect', userId }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.action === 'receive_message') {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { from: data.from, messageText: data.messageText }
                    ]);
                }
            };
        }

        if (document.readyState === 'complete') {
            initWebSocket();
        } else {
            window.addEventListener('load', initWebSocket);
        }

        // Cleanup function to close WebSocket and remove the event listener
        return () => {
            if (ws) {
                ws.close();
            }
            window.removeEventListener('load', initWebSocket);
        };
    }, []);

    const handleSendMessage = () => {
        if (messageText.trim() && socket) {
            socket.send(JSON.stringify({
                action: 'send_message',
                userId,
                messageText
            }));
            setMessages((prevMessages) => [
                ...prevMessages,
                { from: 'You', messageText }
            ]);
            setMessageText('');
        }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setMessageText(event.target.value);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div id="chat-window">
            <input
                type="text"
                value={messageText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
            />
            <div>
                {messages.map((message, index) => (
                    <p key={index}><strong>{message.from}:</strong> {message.messageText}</p>
                ))}
            </div>
        </div>
    );
};

export default Chat;
