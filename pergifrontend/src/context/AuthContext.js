import { createContext, useReducer, useEffect } from "react";

export const AuthContext = createContext()

export const authReducer = (state, action) => {
  switch (action.type){
    case "LOGIN":
      return { user: action.payload }
    case "LOGOUT":
      return {user : null}
    default:
      return state
  }
  
}

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null
  })

  useEffect(() => { 

    const fetchUser = async () => {

      const response = await fetch("http://localhost:4000/auth/googleUser", {
        credentials: 'include',
        mode: 'cors'
      });
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: "LOGIN", payload: json });
      }
    };

    fetchUser();

  }, []) // '[]' is so that only fire the funciton once when the component first renders

  console.log("AuthContext State is: ", state)



  return(
    <AuthContext.Provider value = {{...state, dispatch}}>
      { children }
    </AuthContext.Provider>
  )
}