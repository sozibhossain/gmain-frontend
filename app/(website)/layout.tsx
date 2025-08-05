// import { Footer } from '@/components/sheard/Footer';
// import { Navbar } from '@/components/sheard/Navbar';
// import Testimonial from '@/components/sheard/Testimonial';
// import React, { ReactNode } from 'react';

// // Define types for the component props
// interface LayoutProps {
//   children: ReactNode;
// }

// const Layout = ({ children }: LayoutProps) => {
//   return (
//     <div>
//       <Navbar />
//       {children} {/* This will render the page content */}
//       <Testimonial />
//       <Footer />
//     </div>
//   );
// }

// export default Layout;


import AutoModalWrapper from "@/components/sheard/AutoModalWrapper";
import { Footer } from "@/components/sheard/Footer";
import { Navbar } from "@/components/sheard/Navbar";


import React, { ReactNode } from "react";

// Define types for the component props
interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Navbar />
      {children} 
      {/* <Testimonial /> */}
      <Footer />
      <AutoModalWrapper />
    </div>
  );
};

export default Layout;