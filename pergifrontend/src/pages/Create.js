import CreateClass from "components/CreateClass";
import TemplateForm from "../components/TemplateForm";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "components/Navbar";


const Create = () => {
   return (
      <div>
         <Navbar />

         <CreateClass/>
      </div>

   );
}

export default Create;