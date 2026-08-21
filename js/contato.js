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

    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const subject = subjectSelect.value;
            const message = document.getElementById('message').value;

            let body = `Nome: ${name}\nE-mail: ${email}\n`;
            if (phone) {
                body += `Telefone: ${phone}\n`;
            }
            
            if (subject === 'Agendamento Escolar') {
                const studentCount = studentCountInput.value;
                const visitDate = visitDateInput.value;
                body += `Número de Alunos: ${studentCount}\nData da Visita: ${visitDate}\n`;
            }
            
            body += `\nMensagem:\n${message}`;

            const mailtoUrl = `mailto:museu-carvao@sedac.rs.gov.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoUrl;
        });
    }
});
