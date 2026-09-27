import { useEffect } from 'react';
import { DemoProvider } from './state/DemoProvider';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Lifecycle } from './components/Lifecycle';
import { Products } from './components/Products';
import { Footer } from './components/Footer';
import { DemoStudio } from './demo/DemoStudio';

function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }),
      { threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

export function App() {
  useReveal();
  return (
    <DemoProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Hero />
        <DemoStudio />
        <Lifecycle />
        <Products />
      </main>
      <Footer />
    </DemoProvider>
  );
}
