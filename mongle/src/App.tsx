import { Routes, Route } from "react-router-dom";

import HomePage from "./page/HomePage";
import Login from "./page/Login";
import Signup from "./page/Signup";
import AiConsult from "./page/AiConsultationPage";
import SleepContent from "./page/SleepContentPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/aiConsult" element={<AiConsult />} />
      <Route path="/sleepContent" element={<SleepContent />} />
    </Routes>
  );
}

export default App;