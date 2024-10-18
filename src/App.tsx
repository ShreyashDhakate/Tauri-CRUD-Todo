
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Todo from "./components/Todo";
import "./App.css";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Todo />} />
      </Routes>
    </Router>
  );
}

export default App;
