// Test script to check if form submission works
// Run this in your browser console when the form is open

// Check if formik is properly initialized
console.log('Formik state:', {
  isSubmitting: formik.isSubmitting,
  errors: formik.errors,
  touched: formik.touched,
  values: formik.values,
});

// Check if onSubmit is defined
console.log('OnSubmit handler:', typeof formik.handleSubmit);

// Test form submission
const testSubmit = () => {
  console.log('Testing form submission...');
  try {
    // Check form validation
    const isValid = formik.validateForm();
    console.log('Form validation result:', isValid);

    // Try to submit
    formik.submitForm();
    console.log('Form submitted');
  } catch (error) {
    console.error('Error submitting form:', error);
  }
};

// Add global function for testing
window.testTicketTypeSubmit = testSubmit;
