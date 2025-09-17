export function createStepper(steps: string[], currentStep: number): HTMLElement {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Progreso de compra');
  nav.className = 'stepper';

  steps.forEach((step, index) => {
    const stepEl = document.createElement('button');
    stepEl.type = 'button';
    stepEl.className = 'step';
    stepEl.textContent = step;
    stepEl.setAttribute('aria-current', index === currentStep ? 'step' : 'false');
    stepEl.disabled = index > currentStep;
    nav.appendChild(stepEl);
  });

  return nav;
}