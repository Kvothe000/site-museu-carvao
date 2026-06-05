document.addEventListener('DOMContentLoaded', () => {
    const subjectSelect = document.getElementById('subject');
    const schedulingContainer = document.getElementById('scheduling-fields-container');
    const studentCountInput = document.getElementById('student_count');
    const visitDateInput = document.getElementById('visit_date');

    if (!subjectSelect || !schedulingContainer || !studentCountInput || !visitDateInput) {
        return;
    }

    const toggleSchedulingFields = () => {
        if (subjectSelect.value === 'Agendamento Escolar') {
            schedulingContainer.style.display = 'block';
            studentCountInput.setAttribute('required', 'true');
            visitDateInput.setAttribute('required', 'true');
        } else {
            schedulingContainer.style.display = 'none';
            studentCountInput.removeAttribute('required');
            visitDateInput.removeAttribute('required');
        }
    };

    subjectSelect.addEventListener('change', toggleSchedulingFields);
    
    // Executa no início para restaurar o estado correto se a página for recarregada
    toggleSchedulingFields();
});
