// utils/validateRequiredFields.js

export const validateRequiredFields = (fields, body) => {
  const missing = [];

  for (const field of fields) {
    const keys = field.split('.'); // To support nested keys like offerDetails.title
    let value = body;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null || value === '') break;
    }

    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }

  return missing;
};
