import { useAuthContext } from "./useAuthContext";
import { useAssignmentsContext } from "./useAssignmentsContext";


export const useLogout =  () => {

  const { dispatch } = useAuthContext()

  const { dispatch: dispatchAssignments } = useAssignmentsContext()

  const logout = async () => {
    dispatch({type: "LOGOUT"})
    dispatchAssignments({type: "SET_ASSIGNMENTS", payload: null})

    window.location.href = `${process.env.REACT_APP_API_BACKEND}/auth/logout`;

  }

  return { logout }
}
 
