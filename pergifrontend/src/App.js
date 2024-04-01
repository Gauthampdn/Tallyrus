import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuthContext } from "./hooks/useAuthContext"

// pages & components
import Home from "./pages/Home"
import Login from "./pages/Login";
import Mail from "./pages/Mail";
import Classroom from "pages/Classroom";
import CreateA from "components/CreateA";
import Assignemnt from "pages/Assignment";
import AboutTallyrus from "pages/AboutTallyrus";
import PublicAssignment from "pages/PublicAssignment";
import Rubric from "pages/Rubric";

function App() {

  const { user } = useAuthContext()


  return (
    <div class="">

      <BrowserRouter>
        <div className="pages">
          <Routes>
            <Route
              path="/"
              element={user ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="about"
              element={<AboutTallyrus />}
            />
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" />}
            />

            <Route
              path="/mail"
              element={<Mail />}
            />
            <Route
              path="/classroom/:id"
              element={<Classroom />}
            />
            <Route
              path="/createassignment/:id"
              element={<CreateA />}
            />
            <Route
              path="/submission/:id"
              element={<CreateA />}
            />
            <Route
              path="/assignment/:id"
              element={<Assignemnt />}
            />
            <Route
              path="/publicassignment/:id"
              element={<PublicAssignment/>}
            />
            <Route
              path="/rubric"
              element={<Rubric/>}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
