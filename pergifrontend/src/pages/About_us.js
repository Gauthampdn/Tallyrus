import { useState } from "react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Section = ({ title, text, image }) => {
    return (
        <div className="relative mx-20 mt-20">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-700">{text}</p>
            {image && (
                <div className="max-w-78 max-h-86 flex justify-center mx-auto mt-6">
                    <img src={image} alt={title} className="rounded-lg shadow-lg" />
                </div>
            )}
        </div>
    );
};

const Header = () => {
    return (
      <div className="flex justify-between items-center text-xl font-serif mx-10 bg-transparent">
        <div className="flex justify-start text-xl font-serif mx-20 mt-10">
          Tallyrus
        </div>

        <div className='flex justify-end pr-10 mt-10 '>
          <div className='flex mr-5 text-gray-900 text-sm'>
            <a href="/AboutTallyrus">
              Home
            </a>  
          </div>

          <div className='flex text-gray-900 text-sm'>
            <a href="/payment">
              Services
            </a>
          </div>
        </div>
      </div>
    );
  };


const Info = () => {
    return (
        <div className="relative py-16 mb-32 bg-transparent">
        <div className="mx-auto flex justify-between items-center ">
          <div className="w-full text-left justify-start mx-14 -mt-32">
            <h1 className="text-6xl font-serif font-extrabold mb-6 text-[#231c15]">Who we are </h1>
            <h1 className="text-xl font-serif mt-10 mb-2 text-[#231c15]">
                <p> 
                    At Tallyrus, we are dedicated to making essay grading faster, fairer, and smarter. 
                    We understand that grading essays can be time-consuming for educators, so we’ve built 
                    an AI-powered platform that provides accurate and unbiased assessments within seconds.
                </p>
                
                <p>
                    Our technology is designed to understand the complexity of writing and ensure that every 
                    essay is graded according to the teacher's rubric. This means fair, consistent, and 
                    detailed feedback for every student, helping them improve their writing skills and understand 
                    their areas for growth.
                </p>
            </h1>
          </div>
          
          <div className="flex justify-end pr-16 space-x-4 mb-6">
            <img src="/about_us_1.jpg" 
            style={{ 
              height: '80vh',  // 80% del alto de la pantalla
              maxHeight: '800px',  // Máximo 800px de altura
              width: '60vh',   // Mantener proporciones
              maxWidth: '800px',
              objectFit: 'cover'  // Recortar si es necesario
            }}  />
          </div>

        </div>
      </div>
    );
};


const Features = () => {

    return (
        <div className="bg-transparent text-[#231c15] py-20 px-10 grid grid-cols-2 gap-10 relative mt-20 text-start">

            {/* Benefits for Teachers */}
            <div className="mb-16">
                <h2 className="text-3xl font-semibold mb-4">Benefits for Teachers</h2>
                <p className="mt-2">
                    Tallyrus helps teachers save time by reducing the hours spent grading essays, allowing them to focus 
                    more on their students. Instead of getting overwhelmed with paperwork, educators can spend their energy 
                    on teaching and providing guidance.
                </p>

                <p className="mt-2">
                    Our platform also ensures consistent and personalized feedback for each student, helping them understand
                    their strengths and areas for improvement. This means fair and unbiased grading, aligned with the teacher’s 
                    rubric every time.
                </p>

                <p className="mt-2">
                    Additionally, Tallyrus simplifies classroom management by organizing assignments and tracking submissions, 
                    making it easier for teachers to stay on top of their workload and keep students engaged.
                </p>
            </div>

            {/* Benefits for Students */}
            <div className="mb-16">
                <h2 className="text-3xl font-semibold mb-4">Benefits for Students</h2>
                <p className="mt-2">
                    Tallyrus ensures that students receive detailed and timely feedback on their essays, helping them 
                    understand their strengths and areas for improvement. This consistent feedback allows students to 
                    refine their writing skills and gain confidence in their academic work.
                </p>

                <p className="mt-2">
                    Our AI-powered grading system also guarantees fair and unbiased assessments, ensuring that every student 
                    is evaluated solely based on the quality of their work. This promotes an inclusive learning environment 
                    where all students have an equal opportunity to succeed.
                </p>

                <p className="mt-2">
                    By tracking their progress over time, students can clearly see their improvement, allowing them to 
                    stay motivated and focused on achieving better academic results.
                </p>
            </div>

            {/* More About Us */}
            <div className="">
                <h2 className="text-3xl font-semibold mb-4">More About Us</h2>
                <p className="mt-2">
                    Tallyrus was created by a team of educators and technologists driven by a shared mission: to simplify and 
                    improve the essay grading process. We understand the challenges teachers face when grading large volumes of 
                    student work, and our goal is to make that task faster, fairer, and more efficient.
                </p>

                <p className="mt-2">
                    Our AI-powered tool is designed to provide accurate and unbiased assessments, ensuring that every student 
                    receives consistent feedback. This helps educators focus more on teaching and mentoring, rather than spending 
                    long hours grading.
                </p>

                <p className="mt-2">
                    At Tallyrus, we believe that technology can positively transform education by reducing workload, promoting 
                    fair evaluation, and helping students grow. We are proud to support educators in creating a more effective 
                    and inclusive learning environment.
                </p>
            </div>

            {/* Pricing */}
            <div className="">
                <h2 className="text-3xl font-semibold mb-4">Pricing</h2>
                <p className="mt-2">
                    Tallyrus offers a range of flexible pricing plans designed to accommodate the needs of individual educators, 
                    schools, and districts. Whether you’re a teacher looking for a personal solution or an institution seeking a 
                    scalable tool, we have a plan that fits.
                </p>

                <p className="mt-2">
                    Start by experiencing the full benefits of Tallyrus with our free trial. After that, you can choose a plan 
                    that best aligns with your educational goals, ensuring that you have the right features and support at an 
                    affordable price.
                </p>

                <p className="mt-2">
                    Our pricing options are designed to offer value for all levels of education, and we are committed to helping 
                    you get the most out of our AI-powered grading platform.
                </p>
            </div>
        </div>

    );
    
}



const Prices = () => {
    const navigate = useNavigate(); // Initialize the navigate function

    return ( 
      <div className="bg-transparent mb-40 mt-8 w-screen py-20 px-40 relative justify-center ">
        
        <div className="flex flex-col md:flex-row justify-center gap-6 mt-36 mb-20 fade-in relative top-10">
            <div>
                {/* Plan Gratis */}
                <div className="font-serif text-[#46392b] p-5 w-80 relative -left-36">
                <h2 className="text-4xl font-bold"> Free </h2>
                <ul className="mt-6 mb-6 space-y-4">
                    <li className="flex items-center"><span className="mr-2">✔️</span>Limited Grading</li>
                    <li className="flex items-center"><span className="mr-2">✔️</span>Limited Assignments</li>
                </ul>
                <Button 
                    className="flex items-center rounded-full left-8 px-20 py-8 bg-[#231c15] hover:bg-gray-200 hover:text-black mt-44"
                    onClick={() => navigate('/App')} 
                    >
                    TRY NOW
                </Button> 
                </div>
            </div>
        
            {/* Línea vertical */}
            <div className="hidden md:block w-px bg-[#46392b] mx-4"></div>
          

            {/* Plan Pro */}
            <div className="font-serif text-[#46392b] p-6 w-96 relative left-36">
                <h2 className="text-4xl font-extrabold">Tallyrus Pro</h2>
                <p className=" mt-2">Upgrade to Tallyrus Pro and unlock powerful features.</p>
                <ul className="mt-6 space-y-4">
                <li className="flex items-center"><span className="mr-2">✔️</span>Unlimited Grading</li>
                <li className="flex items-center"><span className="mr-2">✔️</span>Unlimited Assignments</li>
                <li className="flex items-center"><span className="mr-2">✔️</span>Connect to Ed Tech tools</li>
                <li className="flex items-center"><span className="mr-2">✔️</span>AI - Writing Detection</li>
                </ul>
                
                <Button 
                    className="flex items-center rounded-full text-lg left-8 px-20 py-8 bg-[#231c15] hover:bg-gray-200 hover:text-black mt-10"
                    onClick={() => navigate('/Payment')} 
                    >
                    $12.00 <span className=" text-lg">/mo</span>
                </Button> 
                
            </div>
        </div>
      </div>
      
    );
  };





const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

const verifyEmailExists = async (email) => {
    const API_KEY = "TU_API_KEY";
    const url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.data.status === "valid") {
            return true; // El email existe y es válido
        } else {
            return false; // El email no es válido o no existe
        }
    } catch (error) {
        console.error("Error verifying email:", error);
        return false;
    }
};

const Contact = () => {
    const [from_name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [from_email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(from_email)) {
            setEmailError(true);  // Marcar el campo en rojo si el email es inválido
            alert("Please enter a valid email address.");
            return;
        }

        const isValidEmail = await verifyEmailExists(from_email);
        if (!isValidEmail) {
            setEmailError(true);  // Marcar el campo en rojo si el email no existe
            alert("The email address does not exist. Please enter a valid one.");
            return;
        }

        const templateParams = { from_name, from_email, message };

        emailjs
            .send(
                "service_wu86g4o", 
                "template_e47c32m", 
                templateParams,
                "YKTVhqZYkNfiWIzmz" 
            )
            .then(() => alert("Email sent successfully"))
            .catch(() => alert("Error: Please try again later"));

        setEmail("");
        setName("");
        setMessage("");
        setEmailError(false);  // Restablecer el error después de enviar
    };

    return (
        <div className="bg-transparent mt-40 w-screen py-10 px-10 md:px-40 relative text-white">
            <div className="max-w-lg">
                <h2 className="text-3xl font-extrabold text-[#46392b] font-serif mb-4">Contact Us</h2>
                <p>Have any questions? Reach out to us!</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5">
                <label className="block font-medium text-[#46392b] font-serif mt-7">Email</label>
                <input
                    type="email"
                    placeholder="example@gmail.com"
                    className={`w-full p-2 rounded bg-[#d2bd99] border-[#d2bd99] placeholder:text-[#46392b] text-[#46392b] font-serif placeholder:font-serif ${emailError ? "border-red-600 text-red-600" : ""}`} // Aplica borde rojo si hay error
                    value={from_email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label className="block font-medium text-[#46392b] font-serif mt-4">Name</label>
                <input
                    type="text"
                    placeholder="Full name"
                    className="w-full p-2 rounded bg-[#d2bd99] placeholder:text-[#46392b] text-[#46392b] font-serif placeholder:font-serif"
                    value={from_name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <label className="block font-medium text-[#46392b] font-serif mt-4">Message</label>
                <textarea
                    placeholder="Write your message..."
                    className="w-full h-32 p-2 rounded bg-[#d2bd99] placeholder:text-[#46392b] text-[#46392b] font-serif placeholder:font-serif"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />

                <button type="submit" className="bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 transition mt-4">
                    Send Message
                </button>
            </form>
        </div>
    );
};

const AboutUs = () => {
    return (
        <div id="page-background" className="min-h-screen w-full bg-[#d2bd99]">
            <Header />
            <Info />
            <Features />
            <Prices />
            <div className='bg-[#bb9d7a] w-full h-full'> 
                <Contact />
            </div>
        </div>
    );
};

export default AboutUs;
