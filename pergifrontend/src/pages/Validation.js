import axios from 'axios';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { v4 as uuidv4 } from 'uuid';
const logo = "/tallyrus2green.png";



// Validación de código postal
export const validateZipCode = (zipCode) => {
    const zipCodePattern = /^[0-9]{5,10}$/; // Asegura que el código postal tenga entre 5 y 10 dígitos
    return zipCodePattern.test(zipCode);
};


// Validación de fecha de expiración (verifica que sea una fecha futura)
export const isFutureDate = (expiryMonth, expiryYear) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    return expiryYear > currentYear || (expiryYear === currentYear && expiryMonth >= currentMonth);
};


// Validación de correo electrónico
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const generateOrderId = () => {
    return `TL-${uuidv4()}`;
  };


export const generatePaymentPDF = (data) => {
    const { name, email, amount} = data;
    const orderId = generateOrderId();


    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;
  
    img.onload = () => {
      const wideLog = 12;
      doc.addImage(img, "PNG", 10, 10, wideLog, wideLog); // Logo
  
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Tallyrus", 24, 20);
  
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("Payment Confirmation", 15, 58);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 67);
  
      autoTable(doc, {
        startY: 74,
        head: [["Field", "Value"]],
        body: [
          ["Name", name],
          ["Email", email],
          ["Amount", amount],
          ["Order ID", orderId],
        ],
        theme: "grid",
      });
  
      doc.setFontSize(10);
      doc.text("Thank you for your trust in Tallyrus.", 20, doc.internal.pageSize.height - 20);
  
      doc.save("Tallyrus_Payment_Confirmation.pdf");
    };
  };