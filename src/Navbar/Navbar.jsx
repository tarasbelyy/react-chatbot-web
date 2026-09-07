import "./styles.css";
import { useState} from 'react';
import { useAuth } from '../AuthContext'

const Navbar = () => {
    const { user, login, logout} = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [inputPasswordAgain, setInputPasswordAgain] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);

    async function handleSubmit (event) {
        event.preventDefault();
        setErrorMessage(null);
        if (!isLogin) {
            if (inputPassword !== inputPasswordAgain) {
                setErrorMessage("Пароли не совпадают");
                return;
            }
            const payload = { "username": inputUsername, "password": inputPassword };
            const response = await fetch("/api/v1/users/", {method: "POST", headers: {
                "Content-Type": "application/json" 
            }, body: JSON.stringify(payload)});
            const data = await response.json();
            if (!response.ok) {
                setErrorMessage(Object.entries(data).map(([x, y])=>`${x}: ${y}`));
                return;
            }
        }
        const payload = { "username": inputUsername, "password": inputPassword };
        const response = await fetch("/api-token-auth/", {method: "POST", headers: {
            "Content-Type": "application/json" 
        }, body: JSON.stringify(payload)});
        const data = await response.json();
        if (!("token" in data)) {
            setErrorMessage(Object.entries(data).map(([x, y])=>`${x}: ${y}`));
            return;
        }
        const token = `Token ${data.token}`;
        const userData = { name: inputUsername, password: inputPassword, token: token };
        login(userData);
    };

    if (user) {
        return (
            <div className="auth-container">
              <div>Добро пожаловать, {user.name}!</div>
              <button onClick={logout}>Выйти</button>
            </div>
        );
    }

    return (
      <div className="auth-container">
        <div>Войдите или зарегистрируйтесь</div>
        <button disabled={isLogin} onClick={() => setIsLogin(true)}>Войти</button>
        <button disabled={!isLogin} onClick={() => setIsLogin(false)}>
          Зарегистрироваться
        </button>
        <div>{isLogin ? "Вход:" : "Регистрация:"}</div>
        <form onSubmit={handleSubmit}>
          <div className="field-container">
            <label>Имя пользователя:</label>
            <input type="text" onChange={(e) => setInputUsername(e.target.value)} required>
            </input>
          </div>
          <div className="field-container">
            <label>Пароль:</label>
            <input type="password" onChange={(e) => setInputPassword(e.target.value)} required>
            </input>
          </div>
          <div hidden={isLogin} className="field-container">
            <label>Повторите пароль:</label>
            <input type="password" onChange={(e) => setInputPasswordAgain(e.target.value)}>
            </input>
          </div>
          <button type="submit">Отправить</button>
        </form>
        <div hidden={errorMessage === null}>Ошибка! {errorMessage}</div>
      </div>
    );
};

export default Navbar;