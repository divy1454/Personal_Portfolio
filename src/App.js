import React from 'react';
import ClayStage from './components/ClayStage';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Every section with data-chapter gets its own clay object on the stage, in this order.
const App = () => (
  <>
    <ClayStage />
    <Header />
    <main>
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Contact />
    </main>
    <Footer />
  </>
);

export default App;
