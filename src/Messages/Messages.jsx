import "./styles.css";
import {useEffect, useState} from 'react';
import { useAuth } from '../AuthContext'

const Messages = () => {

    const EXIT_PHRASES = new Set(["завершить", "выход", "exit"]);

    const { user } = useAuth();

    const [bots, setBots] = useState([]);
    const [bot, setBot] = useState(null);
    const [messages, setMessages] = useState([]);
    const [option, setOption] = useState(null);
    const [inputValue, setInputValue] = useState(null);

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
    }, [user]);

    function startBot (bot) {
        setBot(bot);
        fetch(`/api/v1/bots/${bot.id}/run/`, {method: "GET", headers: {
            "Authorization": user.token,
            "Content-Type": "application/json" 
        }})
        .then(response => response.json())
        .then(data => setMessages(
          prevMessages => [...prevMessages, {
            author: bot.name,
            message: data.message,
            options: data.next
          }]));
    }

    function selectOption (optionName) {
        setOption(optionName);
        setInputValue("");
        if (EXIT_PHRASES.has(optionName)) {
            setMessages(prevMessages => [...prevMessages, {
              author: "Вы",
              message: optionName
            }])
            const payload = {next: optionName, message: ""};
            fetch(`/api/v1/bots/${bot.id}/run/`, {method: "POST", headers: {
                "Authorization": user.token,
                "Content-Type": "application/json" 
            }, body: JSON.stringify(payload)})
            .then(response => response.json())
            .then(data => setMessages(
              prevMessages => [...prevMessages, {
                author: bot.name,
                message: data.message,
                options: data.next !== "-"? data.next : undefined
              }]));
            setInputValue(null);
            setOption(null);
            setBot(null);
        }
    }

    function handleSubmit (event) {
        event.preventDefault();
        setMessages(prevMessages => [...prevMessages, {
          author: "Вы",
          message: inputValue
        }])
        const payload = {next: option, message: inputValue};
        fetch(`/api/v1/bots/${bot.id}/run/`, {method: "POST", headers: {
            "Authorization": user.token,
            "Content-Type": "application/json" 
        }, body: JSON.stringify(payload)})
        .then(response => response.json())
        .then(data => setMessages(
          prevMessages => [...prevMessages, {
            author: bot.name,
            message: data.message,
            options: data.next !== "-"? data.next : undefined
          }]));
        setInputValue(null);
        setOption(null);
    }

    return (
        <div hidden={!user} className="app-container">
          <h2>ScAIChatBot</h2>
          <div className="bots-container">
            <div>Доступные боты:</div>
            {bots.map(chatbot => (
              <div key={chatbot.id} className="bot-container">
                <span><b>{chatbot.name}</b></span>
                <button hidden={bot} onClick={() => startBot(chatbot)}>Выбрать</button>
                <p>{chatbot.description}</p>
              </div>
            ))}
            <div hidden={!bot}>Выбран бот: {bot?.name}</div>
          </div>
          <div hidden={!messages.length} className="messages-container">
            {messages.map((message, index) => (
              <div key={index}>
                <div><b>{message.author}:</b> {message.message}</div>
              </div>
            ))}
          </div>
          <div 
            hidden={!bot || (bot && !(option || inputValue ===null))} 
            className="interaction-container"
          >
            <div hidden={option}>
              {messages[messages.length-1] && messages[messages.length-1]
                .options?.map(optionName => (
                  <button disabled={option} onClick={() => selectOption(optionName)}>
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
        </div>
    );
}

export default Messages;