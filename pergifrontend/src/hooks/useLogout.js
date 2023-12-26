import { useAuthContext } from "./useAuthContext";
import { useTemplatesContext } from "./useTemplatesContext";


export const useLogout =  () => {

  const { dispatch } = useAuthContext()

  const { dispatch: dispatchTemplates } = useTemplatesContext()

  const logout = async () => {
    dispatch({type: "LOGOUT"})
    dispatchTemplates({type: "SET_TEMPLATES", payload: null})

    window.location.href = `${process.env.REACT_APP_API_BACKEND}/auth/logout`;

  }

  return { logout }
}
 
