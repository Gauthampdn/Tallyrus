import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import enLocale from "i18n-iso-countries/langs/en.json";
import countries from "world-countries";
import Select from 'react-select';
import {
    validateEmail,
    validateZipCode,
    isFutureDate,
    verifyEmailWithAPI,
    generatePaymentPDF,
} from "./Validation";




const PaymentPage = () => {
    const currentYear = new Date().getFullYear();
    const countryNames = countries.map((c) => ({
        label: c.name.common,
        value: c.cca2, // El valor puede ser el código del país, como 'US' para Estados Unidos
    }));

    const navigate = useNavigate();
    


    const [cardNumber, setCardNumber] = useState("");
    const [cvv, setCvv] = useState("");
    const [FirstName, setFirstName] = useState("");
    const [MiddleName, setMiddleName] = useState("");
    const [SN, setSN] = useState("");
    const [Country, setcountry] = useState("");
    const [State, setState] = useState("");
    const [City, setCity] = useState("");
    const [ZipCode, setZipCode] = useState("");
    const [Direcc, setDirecc] = useState("");
    const [Email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");
    const [expiryMonth, setExpiryMonth] = useState("");
    const [expiryYear, setExpiryYear] = useState("");


    

    const handleSubmit = async (event) => {
        event.preventDefault();

        const cardRegex = /^\d{16}$/;
        const cvvRegex = /^\d{3}$/;
        const zipCodeRegex = /^\d{4,10}$/;

        if (!FirstName.trim()) {
            setMessage("First name is required");
            setMessageColor("text-red-500");
            return;
        }
        
        if (!SN.trim()) {
            setMessage("Surname is required");
            setMessageColor("text-red-500");
            return;
        }
        
        if (!Direcc.trim()) {
            setMessage("Address is required");
            setMessageColor("text-red-500");
            return;
        }
        
        if (!City.trim()) {
            setMessage("City is required");
            setMessageColor("text-red-500");
            return;
        }
        
        if (!Country.trim()) {
            setMessage("Country is required");
            setMessageColor("text-red-500");
            return;
        }
        
        if (!State.trim()) {
            setMessage("Region is required");
            setMessageColor("text-red-500");
            return;
        }

        if (!ZipCode.trim() || !zipCodeRegex.test(ZipCode)) {
            setMessage("Invalid zip/postal code");
            setMessageColor("text-red-500");
            return;
        }
        
        if (!Email.trim() || !validateEmail(Email)) {
            setMessage("Invalid email address");
            setMessageColor("text-red-500");
            return;
        }
        /*const isEmailValid = await verifyEmailWithAPI(Email);
        if (!isEmailValid) {
        setMessage("Email does not exist");
        setMessageColor("text-red-500");
        return;
        }*/

        if (!cardRegex.test(cardNumber.replace(/\s+/g, ""))) {
            setMessage("Card number invalid");
            setMessageColor("text-red-500");
            return;
        }

        if (!cvvRegex.test(cvv)) {
            setMessage("CVV invalid");
            setMessageColor("text-red-500");
            return;
        }

        if (!zipCodeRegex.test(ZipCode)) {
            setMessage("Invalid zip code");
            setMessageColor("text-red-500");
            return;
        }

        // Verificar si la fecha es válida al enviar
        if (!expiryMonth || !expiryYear || !isFutureDate(Number(expiryMonth), Number(expiryYear))) {
            setMessage("Expiration date must be future");
            setMessageColor("text-red-500");
            return;
        }

        // Simulación de pago exitoso
        setMessage("Processing payment...");
        setMessageColor("text-blue-500");

        setTimeout(() => {
            setMessage("Payment made successfully");
            setMessageColor("text-green-500");
        
            // Redirigir a otra página después de 1 segundo
            setTimeout(() => {
                navigate('/app'); // Cambia esta ruta por la que necesites
            }, 1000);
        }, 2000);
        

    
        
        generatePaymentPDF({
            name: FirstName + ' ' + MiddleName + ' ' + SN,
            email: Email,
            amount: "$5.00",
            date: new Date().toLocaleString(),
          });
          
    };

    


    return (
        <div className="flex flex-col justify-between min-h-screen bg-gray-100">
            {/* LOGO */}
            <div className="relative top-6 mx-6 p-6">
                <div className="flex justify-start">
                    <img src="/tallyrus2green.png" className="w-8 h-8 mr-1" alt="Tallyrus Logo" />
                    <div className="text-2xl font-extrabold text-black">
                        <a href="/AboutTallyrus">
                            Tallyrus
                        </a> 
                    </div>
                </div>

            </div>
            
            
            
            <div className="mx-auto py-20">
                {/* Payment and Billing Sections */}
                <div className="grid grid-cols-2 gap-28">
                    {/* Payment Info */}
                    <div className="mt-20">
                        <h2 className="text-lg font-semibold mb-6">Payment Info</h2>
                        
                        <div className="flex items-center gap-4 mb-3">
                            <label className="block font-medium whitespace-nowrap">Card Number <span className="text-red-500">*</span></label>
                            <input 
                                className="w-full border py-2 " 
                                type="text"
                                placeholder="  XXXX XXXX XXXX XXXX"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                required
                            />
                        </div>
            
                        <div className="flex items-center gap-4  mb-3">
                            <label className="block font-medium whitespace-nowrap">Expiration Date <span className="text-red-500">*</span></label>
                            <div className="flex gap-4">
                                {/* Mes */}
                                <select className="border p-2" value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)}>
                                <option>MM</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i} value={String(i + 1).padStart(2, '0')}>
                                    {String(i + 1).padStart(2, '0')}
                                    </option>
                                ))}
                                </select>
                                
                                {/* Año */}
                                <select className="border p-2" value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)}>
                                <option>YYYY</option>
                                {[...Array(21)].map((_, i) => (
                                    <option key={i} value={currentYear + i}>
                                    {currentYear + i}
                                    </option>
                                ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                            <label className="block font-medium whitespace-nowrap">Security Code (CVV) <span className="text-red-500">*</span></label>
                            <input 
                                className="w-20 border p-2" 
                                type="text"
                                placeholder=" 123"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                required
                            />
                        </div>
            
                        <div className="flex space-x-2 my-4">
                            <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-8" />
                            <img src="https://img.icons8.com/color/48/mastercard.png" alt="MasterCard" className="h-8" />
                            <img src="https://img.icons8.com/color/48/discover.png" alt="Discover" className="h-8" />
                            <img src="https://img.icons8.com/color/48/amex.png" alt="Amex" className="h-8" />
                        </div>
                    </div>
            
                    {/* Billing Info */}
                    <div>
                        <h2 className="text-lg font-semibold mb-6">Billing Info</h2>
                        
                        <div className="flex items-center gap-4 mb-3">
                            <label className="block font-medium whitespace-nowrap">First Name <span className="text-red-500">*</span></label>
                            <input 
                                className="w-full border p-2" 
                                type="text" 
                                placeholder="First Name"
                                value={FirstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-4 mb-3 mt-4">
                            <label className="block font-medium whitespace-nowrap">Middle Name</label>
                            <input 
                                className="w-full border p-2" 
                                type="text" 
                                placeholder="Middle Name"
                                value={MiddleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4 mb-3 mt-4">
                            <label className="block font-medium whitespace-nowrap">Surname <span className="text-red-500">*</span></label>
                            <input 
                                className="w-full border p-2" 
                                type="text" 
                                placeholder="Surname"
                                value={SN}
                                onChange={(e) => setSN(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-4 mb-3 mt-4">
                            <label className="block font-medium whitespace-nowrap">Address <span className="text-red-500">*</span></label>
                            <input 
                                className="w-full border p-2" 
                                type="text" 
                                placeholder="Address"
                                value={Direcc}
                                onChange={(e) => setDirecc(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3 mt-4">
                            <label className="block font-medium whitespace-nowrap">City <span className="text-red-500">*</span></label>
                            <input 
                                className="w-full border p-2" 
                                type="text" 
                                placeholder="City"
                                value={City}
                                onChange={(e) => setCity(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-4 mb-3 mt-4">
                            <label className="block font-medium whitespace-nowrap">Country <span className="text-red-500">*</span></label>
                            <select value={Country} onChange={(e) => setcountry(e.target.value)} className="...">
                                <option value="">Please Select</option>
                                {countryNames.map((country, idx) => (
                                    <option key={idx} value={country.value}>{country.label}</option>
                                ))}
                            </select>
                            
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                            <label className="block font-medium whitespace-nowrap">Region <span className="text-red-500">*</span></label>
                            <input 
                                className="w-full border p-2" 
                                type="text" 
                                placeholder="Region"
                                value={State}
                                onChange={(e) => setState(e.target.value)}
                                required
                            />
                        </div>


                        <div className="flex items-center gap-4 mb-3 mt-4">
                            <label className="block font-medium whitespace-nowrap">Zip/Postal Code <span className="text-red-500">*</span></label>
                            <input 
                                className="w-full border p-2" 
                                type="text" 
                                placeholder="Zip Code"
                                value={ZipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3 mt-4">
                            <label className="block font-medium whitespace-nowrap">Email Address <span className="text-red-500">*</span></label>
                            <input 
                                className="w-full border p-2" 
                                type="text" 
                                placeholder="Email"
                                value={Email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>
            

            <p className={`text-center mt-3 font-bold ${messageColor}`}>{message}</p>

            <div className="flex justify-center mt-8 mb-28">
                <button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-8 py-3 rounded hover:bg-green-500 transition"
                >
                    Make Payment
                </button>
            </div>



        </div>
    );
  }

  export default PaymentPage;