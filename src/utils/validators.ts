export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isValidPassword(pw: string): boolean {
  return pw.length >= 6;
}

// Luhn algorithm for card validation
export function isValidCardNumber(cardNum: string): boolean {
  const sanitized = cardNum.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function isValidPhone(phone: string): boolean {
  const re = /^\d{10}$/;
  return re.test(phone);
}

export function isValidZip(zip: string): boolean {
  const re = /^\d{5}$/;
  return re.test(zip);
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}