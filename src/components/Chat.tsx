import {useEffect, useState, ChangeEvent, KeyboardEvent, FC} from 'react';

interface Message {
    from: string;
    messageText: string;
}

const Chat: FC = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [userId, setUserId] = useState('user123'); // Replace with dynamic user ID

    useEffect(() => {
        // Initialize WebSocket connection
        const ws = new WebSocket('ws://localhost:3000/', 'echo-protocol');
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

        return () => {
            ws.close();
        };
    }, [userId]);

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
        <span>
            <div>
                <h2>Chat</h2>
                <input
                    type="text"
                    value={messageText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
            <div id="chat-window">
                {messages.map((message, index) => (
                    <p key={index}><strong>{message.from}:</strong> {message.messageText}</p>
                ))}
            </div>
        </span>
    );
};

export default Chat;
