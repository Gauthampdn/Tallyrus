import { createContext, useReducer, useEffect, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    setIsLoading(true);
    
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/auth/googleUser`, {
          credentials: 'include',
          mode: 'cors'
        });
        const json = await response.json();

        if (response.ok) {
          dispatch({ type: "LOGIN", payload: json });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

  }, []) // '[]' is so that only fire the funciton once when the component first renders

  console.log("AuthContext State is: ", state)

  return(
    <AuthContext.Provider value = {{...state, dispatch, isLoading}}>
      { children }
    </AuthContext.Provider>
  )
}