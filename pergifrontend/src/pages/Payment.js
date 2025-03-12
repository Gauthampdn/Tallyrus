import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const PaymentPage = () => {
    const navigate = useNavigate(); // Initialize the navigate function

    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");
    const [FirstName, setFirstName] = useState("");
    const [MiddleName, setMiddleName] = useState("");
    const [FirstSN, setFirstSN] = useState("");
    const [SecondSN, setSecondSN] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        const cardRegex = /^\d{16}$/;
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        const cvvRegex = /^\d{3}$/;

        if (!cardRegex.test(cardNumber.replace(/\s+/g, ""))) {
            setMessage("Card number invalid");
            setMessageColor("text-red-500");
            return;
        }

        if (!expiryRegex.test(expiryDate)) {
            setMessage("Expiration Date invalid");
            setMessageColor("text-red-500");
            return;
        }

        if (!cvvRegex.test(cvv)) {
            setMessage("CVV invalid");
            setMessageColor("text-red-500");
            return;
        }

        // Simulación de pago exitoso
        setMessage("Processing payment...");
        setMessageColor("text-blue-500");

        setTimeout(() => {
            setMessage("Payment made successfully");
            setMessageColor("text-green-500");
        }, 2000);
    };

    return (
        <div className="flex items-start justify-start min-h-screen bg-gray-100">
            <div className="relative top-0 left-0 p-6 flex items-center">
                <img src="/tallyrus2green.png" className="w-10 h-10 mr-2" alt="Tallyrus Logo" />
                <div className="text-2xl font-extrabold text-black">Tallyrus</div>
            </div>

            <div className="bg-white p-20 rounded-lg shadow-lg w-100  justify-center mt-28 ml-16">
                <div className="flex items-center justify-center mb-3 gap-4">
                    <a href="/AboutTallyrus">
                        <img src="/arrow-left.svg" alt="Back" className="w-6 h-6 hover:opacity-80"/>
                    </a>
                    <h2 className="text-center text-3xl font-bold">Secure Payment</h2>
                </div>
                <form onSubmit={handleSubmit}>
                <h3 className="text-m text-gray-800 mb-10"> Total: $12.00</h3>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block font-medium">First Name of the card owner</label>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={FirstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full p-2 border rounded mt-1 mb-5"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block font-medium">Middle Name of the card owner</label>
                        <input
                            type="text"
                            placeholder="Middle Name"
                            value={MiddleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                            className="w-full p-2 border rounded mt-1 mb-5"
                        />   
                    </div>
                </div> 

                <div className="grid grid-cols-2 gap-6">  
                    <div>
                        <label className="block font-medium">First Surname of the card owner</label>
                        <input
                            type="text"
                            placeholder="First Surname"
                            value={FirstSN}
                            onChange={(e) => setFirstSN(e.target.value)}
                            className="w-full p-2 border rounded mt-1 mb-5"
                            required
                        />   
                    </div>
                    
                    <div>
                        <label className="block font-medium">Second Surname of the card owner</label>
                        <input
                            type="text"
                            placeholder="Second Surname"
                            value={SecondSN}
                            onChange={(e) => setSecondSN(e.target.value)}
                            className="w-full p-2 border rounded mt-1 mb-5"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6"> 
                    <div>
                        <label className="block font-medium">Card Number</label>
                        <input
                            type="text"
                            placeholder="XXXX XXXX XXXX XXXX"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-25 p-2 border rounded mt-1 mb-5"
                            required
                        />
                    </div>
                    

                    <div>
                        <label className="block font-medium">Expiration Date</label>
                        <input
                            type="text"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="w-25 p-2 border rounded mt-1 mb-5"
                            required
                        />
                    </div>
                    

                    <div>
                        <label className="block font-medium">CVV</label>
                        <input
                            type="text"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            className="w-25 p-2 border rounded mt-1 mb-5"
                            required
                        />
                    </div>
                    

                </div>
                    

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-3 mt-10 rounded hover:bg-green-500 transition"
                    >
                        Make Payment
                    </button>
                </form>
                <p className={`text-center mt-3 font-bold ${messageColor}`}>{message}</p>
            </div>
        </div>
    );
};

export default PaymentPage;

