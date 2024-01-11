import React from 'react';
import { PDFReader } from 'reactjs-pdf-reader';

const Pdftest = () => {

       return <div style={{overflow:'scroll',height:600}}>
       <PDFReader url="https://aigradertestbucket.s3.us-west-1.amazonaws.com/2024-01-05T07-31-34.283Z-CHI+10+rough+draft+(3).pdf"/>
      </div>
};

export default Pdftest;