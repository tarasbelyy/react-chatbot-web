import "./styles.css";
import {useEffect, useState, useRef} from 'react';
import { useAuth } from '../AuthContext'

const Messages = () => {

    const EXIT_PHRASES = new Set(["завершить", "выход", "exit"]);

    const { user } = useAuth();
    const [bots, setBots] = useState([]);
    const [bot, setBot] = useState(null);
    const [messages, setMessages] = useState([]);
    const [option, setOption] = useState(null);
    const [inputValue, setInputValue] = useState(null);
    const tokensRef = useRef(0);

    useEffect(() => {
        fetch("/api/v1/bots/")
        .then(response => response.json())
        .then(bots => setBots(bots));
    }, []);

    useEffect(() => {
        setMessages([]);
        setBot(null);
        setOption(null);
        setInputValue(null);
        tokensRef.current = 0;
    }, [user]);

    async function startBot(bot) {
        tokensRef.current = 0;
        setBot(bot);
        const response = await fetch(`/api/v1/bots/${bot.id}/run/`,
            {method: "GET", headers: {
                "Authorization": user.token,
                "Content-Type": "application/json" 
        }});
        const data = await response.json();
        setMessages(
            prevMessages => [...prevMessages, {
                author: bot.name,
                message: data.message,
                options: data.next
            }]);
        tokensRef.current += data.tokens.completion;
    }

    async function selectOption(optionName) {
        setOption(optionName);
        setInputValue("");
        if (EXIT_PHRASES.has(optionName)) {
            setInputValue(null);
            setOption(null);
            setMessages(
                prevMessages => [...prevMessages, {
                    author: "Вы",
                    message: optionName
            }]);
            const payload = {next: optionName, message: ""};
            const response = await fetch(`/api/v1/bots/${bot.id}/run/`,
                {method: "POST", headers: {
                    "Authorization": user.token,
                    "Content-Type": "application/json" 
            }, body: JSON.stringify(payload)});
            const data = await response.json();
            setMessages(
                prevMessages => [...prevMessages, {
                    author: bot.name,
                    message: data.message,
                    options: data.next !== "-"? data.next : undefined
            }]);
            tokensRef.current += data.tokens.completion;
            setBot(null);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessages(
            prevMessages => [...prevMessages, {
                author: "Вы",
                message: inputValue
        }])
        const prevInputValue = inputValue;
        setInputValue(null);
        const payload = {next: option, message: prevInputValue};
        const response = await fetch(`/api/v1/bots/${bot.id}/run/`,
            {method: "POST", headers: {
                "Authorization": user.token,
                "Content-Type": "application/json" 
        }, body: JSON.stringify(payload)});
        const data = await response.json();
        setMessages(
            prevMessages => [...prevMessages, {
                author: bot.name,
                message: data.message,
                options: data.next !== "-"? data.next : undefined
        }]);
        tokensRef.current += data.tokens.completion;
        setOption(null);
    }

    return (
        <div hidden={!user} className="app-container">
          <div className="bots-container">
            <div>Доступные боты:</div>
            {bots.map(chatbot => (
              <div key={chatbot.id} className="bot-container">
                <span><b>{chatbot.name}</b></span>
                <button hidden={bot} onClick={() => startBot(chatbot)}>Выбрать</button>
                <p>{chatbot.description}</p>
              </div>
            ))}
            <div hidden={!bot}>Выбран бот: <b>{bot?.name}</b></div>
          </div>
          <div hidden={!messages.length} className="messages-container">
            {messages.map((message, index) => (
              <div key={index}>
                <div><b>{message.author}:</b> {message.message}</div>
              </div>
            ))}
          </div>
          <div 
            hidden={!bot || (!option && inputValue !==null)} 
            className="interaction-container"
          >
            <div hidden={option}>
              {messages[messages.length-1] && messages[messages.length-1]
                .options?.map((optionName, index) => (
                  <button key={index} disabled={option} onClick={() => selectOption(optionName)}>
                    {optionName}
                  </button>
              ))}
            </div>
            <div hidden={inputValue === null}>Выбор опции: {option}. Введите текст:</div>
            <form hidden={inputValue === null} onSubmit={handleSubmit}>
              <input type="text" onChange={(e) => setInputValue(e.target.value)}></input>
              <button type="submit">Отправить</button>
            </form>
          </div>
          <div hidden={bot || !tokensRef.current}>
            Токены ответов чат-бота: {tokensRef.current}
          </div>
        </div>
    );
}

export default Messages;